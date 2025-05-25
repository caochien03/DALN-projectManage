let navigate = null;

export const setNavigate = (navigateFunction) => {
    navigate = navigateFunction;
};

export const redirectToLogin = () => {
    if (navigate) {
        navigate("/login");
    } else {
        window.location.href = "/login";
    }
};
