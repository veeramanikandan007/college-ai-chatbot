import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from jose import jwt
from app.core.config import settings
from app.database.engine import SessionLocal
from app.models.user import User

client = TestClient(app)

class TestRBACBackend:
    @classmethod
    def setup_class(cls):
        db = SessionLocal()
        # Seed test student
        student = db.query(User).filter(User.email == "rbac_student@test.com").first()
        if not student:
            student = User(name="Test Student", email="rbac_student@test.com", hashed_password="x", role="student")
            db.add(student)
        
        # Seed test faculty
        faculty = db.query(User).filter(User.email == "rbac_faculty@test.com").first()
        if not faculty:
            faculty = User(name="Test Faculty", email="rbac_faculty@test.com", hashed_password="x", role="faculty")
            db.add(faculty)

        # Seed test admin
        admin = db.query(User).filter(User.email == "rbac_admin@test.com").first()
        if not admin:
            admin = User(name="Test Admin", email="rbac_admin@test.com", hashed_password="x", role="admin")
            db.add(admin)

        db.commit()
        
        cls.student_id = db.query(User).filter(User.email == "rbac_student@test.com").first().id
        cls.faculty_id = db.query(User).filter(User.email == "rbac_faculty@test.com").first().id
        cls.admin_id = db.query(User).filter(User.email == "rbac_admin@test.com").first().id
        db.close()

    def test_jwt_token_payload_contains_required_rbac_claims(self):
        token = create_access_token(subject=self.student_id, role="student", email="rbac_student@test.com")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        assert payload.get("user_id") == self.student_id
        assert payload.get("email") == "rbac_student@test.com"
        assert payload.get("role") == "student"

    def test_student_role_forbidden_from_admin_endpoints(self):
        token = create_access_token(subject=self.student_id, role="student", email="rbac_student@test.com")
        headers = {"Authorization": f"Bearer {token}"}
        res = client.get("/api/v1/admin/dashboard/overview", headers=headers)
        assert res.status_code == 403

    def test_student_role_forbidden_from_faculty_endpoints(self):
        token = create_access_token(subject=self.student_id, role="student", email="rbac_student@test.com")
        headers = {"Authorization": f"Bearer {token}"}
        res = client.get("/api/v1/faculty/dashboard", headers=headers)
        assert res.status_code == 403

    def test_faculty_role_forbidden_from_admin_endpoints(self):
        token = create_access_token(subject=self.faculty_id, role="faculty", email="rbac_faculty@test.com")
        headers = {"Authorization": f"Bearer {token}"}
        res = client.get("/api/v1/admin/dashboard/overview", headers=headers)
        assert res.status_code == 403

    def test_admin_role_allowed_on_admin_endpoints(self):
        token = create_access_token(subject=self.admin_id, role="admin", email="rbac_admin@test.com")
        headers = {"Authorization": f"Bearer {token}"}
        res = client.get("/api/v1/admin/dashboard/overview", headers=headers)
        assert res.status_code == 200
