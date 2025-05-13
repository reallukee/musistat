(async () => {
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
            document.querySelector("#loggedHeader").hidden = false;
            document.querySelector("#loggedContent").hidden = false;
            document.querySelector("#unloggedContent").hidden = true;

            await showContent();
        } else {
            document.querySelector("#loggedHeader").hidden = true;
            document.querySelector("#loggedContent").hidden = true;
            document.querySelector("#unloggedContent").hidden = false;
        }

        document.querySelector("#timeRange").addEventListener("change", async () => {
            offset = 0;

            await showContent();
        });

        document.querySelector("#limit").addEventListener("change", async () => {
            offset = 0;

            await showContent();
        });

        document.querySelector("#more").addEventListener("click", async () => {
            const limit = document.querySelector("#limit").value;

            offset += parseInt(limit);

            await extendContent();
        });
    });



    async function showContent() {
        const meResponse = await me();

        document.querySelector("#userName").textContent = meResponse.display_name;
        document.querySelector("#userName").href = meResponse.external_urls.spotify;

        const response = await getContent();

        const template = document.querySelector("#pageContentTemplate").innerHTML;

        const data = {
            artists: response,
            offset,
        };

        document.querySelector("#pageContent").innerHTML = ejs.render(template, data);
    }

    async function extendContent() {
        const response = await getContent();

        const template = document.querySelector("#pageContentTemplate").innerHTML;

        const data = {
            artists: response,
            offset,
        };

        document.querySelector("#pageContent").innerHTML += ejs.render(template, data);
    }

    let offset = 0;

    async function getContent() {
        const accessToken = AccessToken.get();

        const timeRange = document.querySelector("#timeRange").value;
        const limit = document.querySelector("#limit").value;

        const endpoint = `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}&offset=${offset}`;

        const options = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
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

                window.location.href = "error.html";
            });

        return response.items;
    }

    async function me() {
        const accessToken = AccessToken.get();

        const endpoint = "https://api.spotify.com/v1/me";

        const options = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        };

        const response = await fetch(endpoint, options)
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw `${response.status} ${response.statusText}`;
                }
            })
            .catch((error) => {
                console.error(error);

                window.location.href = "error.html";
            });

        return response;
    }
})();
