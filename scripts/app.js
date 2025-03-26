(async () => {
    const clientId = "b3d2926223b94540b6901c8da180079e";
    const redirectUri = "https://reallukee.github.io/musistat";
    const scope = "user-read-private user-read-email user-top-read";



    const CodeVerifier = {
        get: () => {
            return localStorage.getItem("musiStat.codeVerifier") ?? null;
        },

        set: (value) => {
            localStorage.setItem("musiStat.codeVerifier", value);
        },

        delete: () => {
            localStorage.removeItem("musiStat.codeVerifier");
        },
    };

    const AccessToken = {
        get: () => {
            return localStorage.getItem("musiStat.accessToken") ?? null;
        },

        set: (value) => {
            localStorage.setItem("musiStat.accessToken", value);
        },

        delete: () => {
            localStorage.removeItem("musiStat.accessToken");
        },
    };

    const RefreshToken = {
        get: () => {
            return localStorage.getItem("musiStat.refreshToken") ?? null;
        },

        set: (value) => {
            localStorage.setItem("musiStat.refreshToken", value);
        },

        delete: () => {
            localStorage.removeItem("musiStat.refreshToken");
        },
    };

    const ExpiresIn = {
        get: () => {
            return localStorage.getItem("musiStat.expiresIn") ?? null;
        },

        set: (value) => {
            localStorage.setItem("musiStat.expiresIn", value);
        },

        delete: () => {
            localStorage.removeItem("musiStat.expiresIn");
        },
    };

    const ExpiresAt = {
        get: () => {
            return localStorage.getItem("musiStat.expiresAt") ?? null;
        },

        set: (value) => {
            localStorage.setItem("musiStat.expiresAt", value);
        },

        delete: () => {
            localStorage.removeItem("musiStat.expiresAt");
        },
    };



    const params = new URLSearchParams(location.search);

    const code = params.get("code") ?? null;

    if (code) {
        const url = new URL(location.href);

        url.searchParams.delete("code");

        const updatedUrl = url.search ? url.href : url.href.replace("?", "");

        history.replaceState({}, document.title, updatedUrl);

        await token();
    }

    if (AccessToken.get() && RefreshToken.get()) {
        const currentTime = Math.floor(Date.now() / 1000);

        if (currentTime > ExpiresAt.get()) {
            await refresh();
        }

        document.querySelector("#login").hidden = true;
        document.querySelector("#logout").hidden = false;

        if (document.querySelector("#homeLogin")) {
            document.querySelector("#homeLogin").hidden = true;
        }

        if (document.querySelector("#homeLogout")) {
            document.querySelector("#homeLogout").hidden = false;
        }
    } else {
        document.querySelector("#login").hidden = false;
        document.querySelector("#logout").hidden = true;

        if (document.querySelector("#homeLogin")) {
            document.querySelector("#homeLogin").hidden = false;
        }

        if (document.querySelector("#homeLogout")) {
            document.querySelector("#homeLogout").hidden = true;
        }
    }



    async function authorize() {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const randomCharacters = crypto.getRandomValues(new Uint8Array(64));

        const codeVerifier = randomCharacters.reduce((accumulator, currentValue) => {
            return accumulator + characters[currentValue % characters.length];
        }, "");

        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);

        const hash = await crypto.subtle.digest("SHA-256", data);

        let codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)));

        codeChallenge = codeChallenge.replace(/=/g, "");
        codeChallenge = codeChallenge.replace(/\+/g, "-");
        codeChallenge = codeChallenge.replace(/\//g, "_");

        CodeVerifier.set(codeVerifier);

        const endpoint = "https://accounts.spotify.com/authorize";

        const url = new URL(endpoint);

        const params = {
            response_type: "code",
            client_id: clientId,
            scope: scope,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
            redirect_uri: redirectUri,
        };

        url.search = new URLSearchParams(params).toString();

        location.href = url.toString();
    }

    async function token() {
        const codeVerifier = CodeVerifier.get();

        const endpoint = "https://accounts.spotify.com/api/token";

        const body = {
            client_id: clientId,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(body),
        };

        const response = await fetch(endpoint, options)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw `${response.status} ${response.statusText}`;
                }
            })
            .catch((error) => {
                console.error(error);
            });

        AccessToken.set(response.access_token);
        RefreshToken.set(response.refresh_token);
        ExpiresIn.set(response.expires_in);

        const issuedAt = Math.floor(Date.now() / 1000);
        const expiresIn = response.expires_in;
        const expiresAt = issuedAt + expiresIn;

        ExpiresAt.set(expiresAt);
    }

    async function refresh() {
        const refreshToken = RefreshToken.get();

        const endpoint = "https://accounts.spotify.com/api/token";

        const body = {
            client_id: clientId,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(body),
        };

        const response = await fetch(endpoint, options)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw `${response.status} ${response.statusText}`;
                }
            })
            .catch((error) => {
                console.error(error);
            });

        AccessToken.set(response.access_token);
        RefreshToken.set(response.refresh_token);
        ExpiresIn.set(response.expires_in);

        const issuedAt = Math.floor(Date.now() / 1000);
        const expiresIn = response.expires_in;
        const expiresAt = issuedAt + expiresIn;

        ExpiresAt.set(expiresAt);
    }



    async function login() {
        await authorize();
    }

    document.querySelector("#login")?.addEventListener("click", () => {
        if (!AccessToken.get() && !RefreshToken.get()) {
            login();
        }
    });

    document.querySelector("#homeLogin")?.addEventListener("click", () => {
        if (!AccessToken.get() && !RefreshToken.get()) {
            login();
        }
    });

    async function logout() {
        CodeVerifier.delete();
        AccessToken.delete();
        RefreshToken.delete();
        ExpiresIn.delete();
        ExpiresAt.delete();

        location.href = "./";
    }

    document.querySelector("#logout")?.addEventListener("click", () => {
        if (AccessToken.get() && RefreshToken.get()) {
            logout();
        }
    });

    document.querySelector("#homeLogout")?.addEventListener("click", () => {
        if (AccessToken.get() && RefreshToken.get()) {
            logout();
        }
    });
})();
