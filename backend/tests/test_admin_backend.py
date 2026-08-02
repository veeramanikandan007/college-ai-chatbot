import sys
import os
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.engine import engine, SessionLocal
from app.database.base import Base
from app.database.init_db import init_db
from app.models.admin import AdminDepartmentModel, AdminAnnouncementModel, AdminSettingsModel, AdminAuditLogModel


class TestAdminBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        init_db(cls.db)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_admin_settings(self):
        st = self.db.query(AdminSettingsModel).first()
        if not st:
            st = AdminSettingsModel(
                college_name="Mount Zion College of Engineering and Technology",
                college_code="MZCET-9132",
            )
            self.db.add(st)
            self.db.commit()
            self.db.refresh(st)

        self.assertIsNotNone(st)
        self.assertEqual(st.college_code, "MZCET-9132")
        print("  [PASS] Admin Settings")

    def test_02_admin_departments_crud(self):
        dept = AdminDepartmentModel(
            code="AI_DS",
            name="Artificial Intelligence & Data Science",
            head_of_department="Dr. K. Anand",
            total_courses=8,
            total_sections=2,
        )
        self.db.add(dept)
        self.db.commit()
        self.db.refresh(dept)
        self.assertIsNotNone(dept.id)

        fetched = self.db.query(AdminDepartmentModel).filter(AdminDepartmentModel.code == "AI_DS").first()
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.name, "Artificial Intelligence & Data Science")

        self.db.delete(fetched)
        self.db.commit()
        print("  [PASS] Admin Departments CRUD")

    def test_03_admin_announcements_crud(self):
        ann = AdminAnnouncementModel(
            title="Unit Test Announcement",
            content="Testing announcement creation for entire college",
            target_type="Entire College",
            priority="High",
        )
        self.db.add(ann)
        self.db.commit()
        self.db.refresh(ann)
        self.assertIsNotNone(ann.id)

        self.db.delete(ann)
        self.db.commit()
        print("  [PASS] Admin Announcements CRUD")


if __name__ == "__main__":
    unittest.main()
