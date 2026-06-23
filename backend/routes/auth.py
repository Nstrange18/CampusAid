from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
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

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

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
            
    return res
