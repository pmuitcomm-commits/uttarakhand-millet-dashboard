"""
Role normalization helpers for authentication and authorization routes.
"""

ROLE_MAP = {
    1: "admin",
    2: "district",
    3: "block",
    4: "farmer",
}

OFFICER_ROLES = {"admin", "district", "block"}
VALID_ROLE_VALUES = set(ROLE_MAP.values())
ROLE_ALIASES = {
    "district_officer": "district",
    "block_officer": "block",
}
PUBLIC_REGISTRATION_ROLE = "farmer"


def canonical_role_value(role_value) -> str:
    """Return the lowercase app role value, including legacy alias support."""
    if hasattr(role_value, "value"):
        role_value = role_value.value
    role = str(role_value).split(".")[-1].lower()
    return ROLE_ALIASES.get(role, role)


def normalize_role(role_value) -> str:
    """Normalize stored role values to the frontend/API role naming convention."""
    if role_value is None:
        return PUBLIC_REGISTRATION_ROLE
    role = canonical_role_value(role_value)
    return role if role in VALID_ROLE_VALUES else PUBLIC_REGISTRATION_ROLE
