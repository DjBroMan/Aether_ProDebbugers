"""
Aether Frontend - Auth Flow Structural Tests
Tests the auth guard implementation, route structure, and store correctness
using Python for structural/static analysis (no browser needed).
"""
import os
import re
import json
import pytest

FRONTEND = r"c:\Users\asus\Desktop\Prodebugger\Aether_ProDebbugers\aether-frontend"
APP = os.path.join(FRONTEND, "app")
STORE = os.path.join(FRONTEND, "store", "authStore.ts")
ROOT_LAYOUT = os.path.join(APP, "_layout.tsx")
TABS_LAYOUT = os.path.join(APP, "(tabs)", "_layout.tsx")
PROFILE = os.path.join(APP, "(tabs)", "profile.tsx")
INDEX = os.path.join(APP, "index.tsx")
STUDENT_DASH = os.path.join(FRONTEND, "components", "dashboard", "StudentDashboard.tsx")
FACULTY_DASH = os.path.join(FRONTEND, "components", "dashboard", "FacultyDashboard.tsx")
ADMIN_DASH = os.path.join(FRONTEND, "components", "dashboard", "AdminDashboardComponent.tsx")
APPROVAL_LIST = os.path.join(FRONTEND, "components", "dashboard", "ApprovalList.tsx")
NOTICE_BOARD = os.path.join(FRONTEND, "components", "dashboard", "NoticeBoard.tsx")
ANALYTICS = os.path.join(FRONTEND, "components", "dashboard", "AnalyticsWidget.tsx")
DASHBOARD_WRAPPER = os.path.join(APP, "(tabs)", "index.tsx")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


# ─────────────────────────────────────────────
# 1. AUTH STORE TESTS
# ─────────────────────────────────────────────
class TestAuthStore:
    def test_file_exists(self):
        assert os.path.exists(STORE), "authStore.ts must exist"

    def test_has_faculty_role(self):
        content = read(STORE)
        assert "'FACULTY'" in content, "FACULTY role must be defined"

    def test_has_admin_role(self):
        content = read(STORE)
        assert "'ADMIN'" in content, "ADMIN role must be defined"

    def test_has_student_role(self):
        content = read(STORE)
        assert "'STUDENT'" in content, "STUDENT role must be defined"

    def test_authority_level_field(self):
        content = read(STORE)
        assert "authorityLevel" in content, "authorityLevel must be in AuthUser interface"

    def test_logout_fn_resets_user(self):
        content = read(STORE)
        assert "logout" in content, "logout function must exist in store"
        assert "user: null" in content, "logout must reset user to null"

    def test_no_legacy_roles(self):
        """Old roles like PROFESSOR/HOD/PRINCIPAL should be gone from type definition"""
        content = read(STORE)
        # The role type line should not include old role names
        type_line_match = re.search(r"export type UserRole\s*=\s*([^;]+);", content)
        assert type_line_match, "UserRole type must be defined"
        type_def = type_line_match.group(1)
        for old_role in ["'PROFESSOR'", "'HOD'", "'PRINCIPAL'"]:
            assert old_role not in type_def, f"Legacy role {old_role} must be removed from UserRole type"


# ─────────────────────────────────────────────
# 2. AUTH GUARD / NAVIGATION TESTS
# ─────────────────────────────────────────────
class TestAuthGuard:
    def test_root_layout_has_no_navigation(self):
        """Root _layout.tsx must NOT navigate — Stack not ready when its effects fire."""
        content = read(ROOT_LAYOUT)
        assert "router.replace" not in content, \
            "_layout.tsx must NOT contain router.replace"
        assert "useRouter" not in content, \
            "_layout.tsx must NOT import useRouter"

    def test_root_layout_no_synchronous_redirect(self):
        content = read(ROOT_LAYOUT)
        jsx_redirect = re.search(r"return\s*\(.*<Redirect", content, re.DOTALL)
        assert not jsx_redirect, "<Redirect> must NOT be rendered synchronously in layout"

    def test_tabs_layout_has_auth_guard(self):
        """(tabs)/_layout MUST have the auth guard useEffect using CommonActions.reset.
        CommonActions.reset is the only reliable way to escape a nested Tabs navigator."""
        content = read(TABS_LAYOUT)
        assert "useAuthStore" in content, "(tabs)/_layout must import useAuthStore"
        assert "useEffect" in content, "(tabs)/_layout must use useEffect for auth guard"
        assert "!user" in content, "(tabs)/_layout must check for null user"
        assert "CommonActions" in content or "navigation.dispatch" in content, \
            "(tabs)/_layout must use CommonActions.reset to escape the nested navigator"

    def test_tabs_layout_no_sync_redirect(self):
        content = read(TABS_LAYOUT)
        jsx_redirect = re.search(r"return\s*\(.*<Redirect", content, re.DOTALL)
        assert not jsx_redirect, "(tabs)/_layout must not have synchronous <Redirect>"

    def test_profile_calls_logout(self):
        content = read(PROFILE)
        assert "logout" in content, "Profile must call logout()"

    def test_profile_does_not_directly_navigate(self):
        """Profile must NOT call router.replace — guard in (tabs)/_layout handles it.
        Double-navigation caused the tab bar to remain visible (black screen bug)."""
        content = read(PROFILE)
        assert "router.replace" not in content, \
            "Profile must NOT call router.replace directly — tabs layout guard handles redirect"

    def test_landing_redirects_if_already_logged_in(self):
        """Landing screen redirects to tabs if user already logged in."""
        content = read(INDEX)
        assert "user" in content, "Landing must read user from store"
        assert "/(tabs)" in content, "Landing must redirect to tabs when user is set"
        assert "useEffect" in content, "Landing must use useEffect for the redirect"




# ─────────────────────────────────────────────
# 3. LANDING SCREEN DEMO LOGIN TESTS
# ─────────────────────────────────────────────
class TestLandingScreen:
    def test_demo_student_button(self):
        content = read(INDEX)
        assert "STUDENT" in content, "Landing screen must have Student demo login"

    def test_demo_faculty_buttons(self):
        content = read(INDEX)
        assert "FACULTY" in content, "Landing screen must have Faculty demo login"
        assert "authorityLevel" in content or "level" in content.lower(), \
            "Faculty demo buttons must pass authority level"

    def test_demo_admin_button(self):
        content = read(INDEX)
        assert "'ADMIN'" in content, "Landing screen must have Admin demo login"

    def test_no_old_dev_mode_button(self):
        content = read(INDEX)
        assert "enterDevMode" not in content, \
            "Old enterDevMode button should be replaced with quick-login buttons"

    def test_google_login_still_present(self):
        content = read(INDEX)
        assert "promptAsync" in content or "Google" in content, \
            "Google login should still be present as a real auth option"


# ─────────────────────────────────────────────
# 4. DASHBOARD ROUTING TESTS
# ─────────────────────────────────────────────
class TestDashboardRouter:
    def test_wrapper_routes_student(self):
        content = read(DASHBOARD_WRAPPER)
        assert "StudentDashboard" in content, "DashboardWrapper must render StudentDashboard"
        assert "user.role === 'STUDENT'" in content or "role === 'STUDENT'" in content, \
            "DashboardWrapper must check for STUDENT role"

    def test_wrapper_routes_faculty(self):
        content = read(DASHBOARD_WRAPPER)
        assert "FacultyDashboard" in content, "DashboardWrapper must render FacultyDashboard"
        assert "FACULTY" in content, "DashboardWrapper must check for FACULTY role"

    def test_wrapper_routes_admin(self):
        content = read(DASHBOARD_WRAPPER)
        assert "AdminDashboardComponent" in content, "DashboardWrapper must render AdminDashboardComponent"
        assert "ADMIN" in content, "DashboardWrapper must check for ADMIN role"

    def test_wrapper_handles_null_user(self):
        content = read(DASHBOARD_WRAPPER)
        assert "!user" in content, "DashboardWrapper must handle null/missing user"


# ─────────────────────────────────────────────
# 5. DASHBOARD COMPONENT EXISTENCE TESTS
# ─────────────────────────────────────────────
class TestDashboardComponents:
    def test_student_dashboard_exists(self):
        assert os.path.exists(STUDENT_DASH), "StudentDashboard.tsx must exist"

    def test_faculty_dashboard_exists(self):
        assert os.path.exists(FACULTY_DASH), "FacultyDashboard.tsx must exist"

    def test_admin_dashboard_exists(self):
        assert os.path.exists(ADMIN_DASH), "AdminDashboardComponent.tsx must exist"

    def test_faculty_uses_authority_level(self):
        content = read(FACULTY_DASH)
        assert "authorityLevel" in content or "level" in content, \
            "FacultyDashboard must use authorityLevel prop"
        assert "level === 3" in content or "level == 3" in content, \
            "FacultyDashboard must handle level 3 (Principal)"
        assert "level === 2" in content or "level == 2" in content, \
            "FacultyDashboard must handle level 2 (HOD)"

    def test_approval_list_exists(self):
        assert os.path.exists(APPROVAL_LIST), "ApprovalList.tsx must exist"

    def test_notice_board_exists(self):
        assert os.path.exists(NOTICE_BOARD), "NoticeBoard.tsx must exist"

    def test_analytics_widget_exists(self):
        assert os.path.exists(ANALYTICS), "AnalyticsWidget.tsx must exist"

    def test_approval_list_filters_by_level(self):
        content = read(APPROVAL_LIST)
        assert "level" in content, "ApprovalList must accept a level prop"
        assert "filter" in content, "ApprovalList must filter approvals by level"


# ─────────────────────────────────────────────
# 6. NATIVEWIND SAFETY TESTS
# ─────────────────────────────────────────────
class TestNativeWindSafety:
    KNOWN_CRASHERS = [
        r"bg-gradient-to-r",
        r"from-aether-\w+\s+to-aether-\w+",
        r"bg-white/\d+",
        r"bg-black/\d+",
        r"text-white/\d+",
    ]

    def _scan_dir(self, directory):
        """Scan all tsx/ts files in a directory recursively"""
        issues = []
        for root, _, files in os.walk(directory):
            for fname in files:
                if fname.endswith((".tsx", ".ts")):
                    fpath = os.path.join(root, fname)
                    content = read(fpath)
                    for pattern in self.KNOWN_CRASHERS:
                        if re.search(pattern, content):
                            issues.append(f"{fpath}: matched '{pattern}'")
        return issues

    def test_no_crash_classes_in_app(self):
        issues = self._scan_dir(APP)
        assert not issues, (
            "Crash-causing NativeWind classes found in app/:\n" + "\n".join(issues)
        )

    def test_no_crash_classes_in_components(self):
        components_dir = os.path.join(FRONTEND, "components", "dashboard")
        issues = self._scan_dir(components_dir)
        assert not issues, (
            "Crash-causing NativeWind classes found in components/:\n" + "\n".join(issues)
        )
