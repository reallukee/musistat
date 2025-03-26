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
            document.querySelector("#loggedContent").hidden = false;
            document.querySelector("#unloggedContent").hidden = true;

            await showContent();
        } else {
            document.querySelector("#loggedContent").hidden = true;
            document.querySelector("#unloggedContent").hidden = false;
        }
    });



    async function showContent() {
        const response = await getContent();

        console.log(response);

        const template = document.querySelector("#pageContentTemplate").innerHTML;

        const data = {
            me: response,
        };

        document.querySelector("#pageContent").innerHTML = ejs.render(template, data);
    }

    async function getContent() {
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
            });

        return response;
    }
})();
