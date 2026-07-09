import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..utils import rate_limit_auth, rate_limit_login, rate_limit_invite

router = APIRouter(prefix="/auth", tags=["Authentication"])

def issue_token_pair(user: models.User, db: Session) -> dict:
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    refresh_token = auth.create_refresh_token()
    refresh_record = models.RefreshToken(
        user_id=user.user_id,
        token_hash=auth.get_refresh_token_hash(refresh_token),
        expires_at=auth.get_refresh_token_expiry()
    )
    db.add(refresh_record)
    db.commit()
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_auth)])
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Block admin self-registration — admins must use invite links
    if user_in.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin registration is invite-only. Please use an invite link from a super administrator."
        )

    # Hash the password
    hashed_password = auth.get_password_hash(user_in.password)

    # Create the user
    new_user = models.User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone_number=user_in.phone_number,
        password_hash=hashed_password,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create role-specific tables
    try:
        if user_in.role == "student":
            if not user_in.matric_number or not user_in.department or not user_in.faculty or not user_in.level:
                db.delete(new_user)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Student registration requires matric_number, department, faculty, and level"
                )
            
            # Check for unique matric number
            existing_matric = db.query(models.Student).filter(models.Student.matric_number == user_in.matric_number).first()
            if existing_matric:
                db.delete(new_user)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Matric number already registered"
                )

            new_student = models.Student(
                user_id=new_user.user_id,
                matric_number=user_in.matric_number,
                department=user_in.department,
                faculty=user_in.faculty,
                level=user_in.level
            )
            db.add(new_student)
            db.commit()

        elif user_in.role == "donor":
            new_donor = models.Donor(
                user_id=new_user.user_id,
                donor_type=user_in.donor_type or "individual",
                organization_name=user_in.organization_name,
                address=user_in.address
            )
            db.add(new_donor)
            db.commit()

        elif user_in.role == "admin":
            if not user_in.staff_id or not user_in.position:
                db.delete(new_user)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Admin registration requires staff_id and position"
                )
            
            existing_staff = db.query(models.Administrator).filter(models.Administrator.staff_id == user_in.staff_id).first()
            if existing_staff:
                db.delete(new_user)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Staff ID already registered"
                )

            new_admin = models.Administrator(
                user_id=new_user.user_id,
                staff_id=user_in.staff_id,
                position=user_in.position
            )
            db.add(new_admin)
            db.commit()

    except HTTPException as e:
        raise e
    except Exception as e:
        db.delete(new_user)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error registering user: {str(e)}"
        )

    return new_user

@router.post("/login", response_model=schemas.Token, dependencies=[Depends(rate_limit_login)])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return issue_token_pair(user, db)

@router.post("/refresh", response_model=schemas.Token, dependencies=[Depends(rate_limit_auth)])
def refresh_token(data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    token_hash = auth.get_refresh_token_hash(data.refresh_token)
    token_record = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == token_hash
    ).first()

    if (
        not token_record
        or token_record.revoked_at is not None
        or token_record.expires_at < datetime.datetime.utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user = db.query(models.User).filter(models.User.user_id == token_record.user_id).first()
    if not user:
        token_record.revoked_at = datetime.datetime.utcnow()
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    token_record.revoked_at = datetime.datetime.utcnow()
    db.commit()
    return issue_token_pair(user, db)

@router.post("/logout")
def logout(data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    token_hash = auth.get_refresh_token_hash(data.refresh_token)
    token_record = db.query(models.RefreshToken).filter(
        models.RefreshToken.token_hash == token_hash,
        models.RefreshToken.revoked_at.is_(None)
    ).first()

    if token_record:
        token_record.revoked_at = datetime.datetime.utcnow()
        db.commit()

    return {"message": "Logged out"}

@router.get("/me")
def get_me(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Prepare detailed profile payload
    res = {
        "user_id": current_user.user_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "role": current_user.role,
        "created_at": current_user.created_at
    }
    
    if current_user.role == "student":
        student = db.query(models.Student).filter(models.Student.user_id == current_user.user_id).first()
        if student:
            res["student_id"] = student.student_id
            res["matric_number"] = student.matric_number
            res["department"] = student.department
            res["faculty"] = student.faculty
            res["level"] = student.level
            res["student_status"] = student.student_status
            
    elif current_user.role == "donor":
        donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.user_id).first()
        if donor:
            res["donor_id"] = donor.donor_id
            res["donor_type"] = donor.donor_type
            res["organization_name"] = donor.organization_name
            res["address"] = donor.address
            
    elif current_user.role == "admin":
        admin = db.query(models.Administrator).filter(models.Administrator.user_id == current_user.user_id).first()
        if admin:
            res["admin_id"] = admin.admin_id
            res["staff_id"] = admin.staff_id
            res["position"] = admin.position
            res["is_super_admin"] = admin.is_super_admin
            
    return res


@router.get("/validate-invite/{token}", dependencies=[Depends(rate_limit_invite)])
def validate_invite_token(token: str, db: Session = Depends(get_db)):
    """Check if an admin invite token is valid (exists, unused, not expired)."""
    invite = db.query(models.AdminInviteToken).filter(models.AdminInviteToken.token == token).first()
    if not invite:
        return {"valid": False, "reason": "Invite link not found"}
    if invite.is_used:
        return {"valid": False, "reason": "This invite link has already been used"}
    if invite.expires_at < datetime.datetime.utcnow():
        return {"valid": False, "reason": "This invite link has expired"}
    return {"valid": True, "expires_at": invite.expires_at}


@router.post("/register/admin-invite", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_invite)])
def register_admin_via_invite(data: schemas.AdminRegisterViaInvite, db: Session = Depends(get_db)):
    """Register a new admin using a one-time invite token."""
    # Validate token
    invite = db.query(models.AdminInviteToken).filter(models.AdminInviteToken.token == data.token).first()
    if not invite:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invite token")
    if invite.is_used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This invite link has already been used")
    if invite.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This invite link has expired")

    # Check email uniqueness
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Check staff_id uniqueness
    existing_staff = db.query(models.Administrator).filter(models.Administrator.staff_id == data.staff_id).first()
    if existing_staff:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Staff ID already registered")

    # Create the user
    hashed_password = auth.get_password_hash(data.password)
    new_user = models.User(
        full_name=data.full_name,
        email=data.email,
        phone_number=data.phone_number,
        password_hash=hashed_password,
        role="admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create admin record
    try:
        new_admin = models.Administrator(
            user_id=new_user.user_id,
            staff_id=data.staff_id,
            position=data.position,
            is_super_admin=False
        )
        db.add(new_admin)

        # Mark token as used
        invite.is_used = True
        invite.used_by_user_id = new_user.user_id

        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.delete(new_user)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating admin account: {str(e)}"
        )

    return new_user
