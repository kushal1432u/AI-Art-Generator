import sys
import os
sys.path.append(os.getcwd())

from backend.database import SessionLocal, engine
from backend import models, schemas
from backend.utils.security import get_password_hash

def test_registration():
    try:
        models.Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        
        email = "test_script@example.com"
        # Cleanup
        db.query(models.User).filter(models.User.email == email).delete()
        db.commit()
        
        print("Hashing password...")
        hashed_password = get_password_hash("password123")
        print(f"Hashed: {hashed_password[:10]}...")
        
        print("Creating user model...")
        new_user = models.User(
            name="Test Script",
            email=email,
            password_hash=hashed_password
        )
        
        print("Adding to DB...")
        db.add(new_user)
        print("Commiting...")
        db.commit()
        print("Refreshing...")
        db.refresh(new_user)
        print(f"Success! User ID: {new_user.id}, Created At: {new_user.created_at}")
        db.close()
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_registration()
