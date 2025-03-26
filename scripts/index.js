(() => {
    const AccessToken = {
        get: () => {
            return localStorage.getItem("musiStat.accessToken") ?? null;
        },
    };

    const RefreshToken = {
        get: () => {
            return localStorage.getItem("musiStat.refreshToken") ?? null;
        },
    };



    window.addEventListener("DOMContentLoaded", async () => {
        if (AccessToken.get() && RefreshToken.get()) {
            location.href = "./me.html";
        }
    });
})();
