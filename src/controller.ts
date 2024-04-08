import { IncomingMessage, ServerResponse } from "http";
import { database } from "./model";
import { renderTemplate } from "./view";
import { PollingWatchKind } from "typescript";

/**
 * All of these function have a TODO comment. Follow the steps in the
 * instructions to know which function to work on, and in what order.
 */

export const getHome = async (req: IncomingMessage, res: ServerResponse) => {
    /** TODO:
     * 1. Grab the language cookie from the request.
     * 2. Get the language from the cookie.
     * 3. Send the appropriate Welcome message to the view based on the language.
     */

    const cookies = getCookies(req);

    const defaultLanguage = "en";
    let languageValue = cookies["language"];

    if (!languageValue) {
        languageValue = defaultLanguage;
    }

    let theMessage: string;

    if (languageValue === "fr") {
        theMessage = "Bienvenue!";
    } else if (languageValue === "en") {
        theMessage = "Welcome!";
    } else {
        theMessage = "Welcome!";
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Set-Cookie", [
        "likes=Lemon",
        "lovesWebDev=TRUE!",
        "language=" + languageValue,
    ]);
    res.end(
        await renderTemplate("src/views/HomeView.hbs", {
            title: theMessage,
        }),
    );
};

export const changeLanguage = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    /** TODO:
     * 1. Parse the body of the request.
     * 2. Extract the language from the body. This data is coming from a form submission.
     * 3. Set the language cookie.
     * 4. Redirect the user back to the previous page using the referer header.
     *    @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer
     * 5. End the response.
     */

    const body = await parseBody(req);

    console.log(body);

    let languageKey = body.split("=")[1];

    

    if (req.headers.referer) {
        let pathString = req.headers.referer.substring(21)
        res.statusCode = 303;
        res.setHeader("Location", pathString);
        res.setHeader("Set-Cookie", [
            "likes=Lemon",
            "lovesWebDev=TRUE!",
            "language=" + languageKey,
        ]);
        res.end();
    }
};

export const getOnePokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    /** TODO:
     * 1. Grab the language cookie from the request.
     * 2. Get the language from the cookie.
     * 3. Send the appropriate Pokemon data to the view based on the language.
     */

    const id = Number(req.url?.split("/")[2]);
    const foundPokemon = database.find((pokemon) => pokemon.id === id);

    if (!foundPokemon) {
        res.statusCode = 404;
        res.end(
            await renderTemplate("src/views/ErrorView.hbs", {
                title: "Error",
                message: "Pokemon not found!",
            }),
        );
        return;
    }

    // Cookies
    const cookies = getCookies(req);

    const defaultLanguage = "en";
    let languageValue = cookies["language"];

    if (!languageValue) {
        languageValue = defaultLanguage;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Set-Cookie", [
        "likes=Lemon",
        "lovesWebDev=TRUE!",
        "language=" + languageValue,
    ]);

    res.end(
        await renderTemplate("src/views/ShowView.hbs", {
            pokemon: {
                name:
                    languageValue === "fr"
                        ? foundPokemon.name.fr
                        : languageValue === "en"
                          ? foundPokemon.name.en
                          : foundPokemon.name.en,
                type:
                    languageValue === "fr"
                        ? foundPokemon.type.fr
                        : languageValue === "en"
                          ? foundPokemon.type.en
                          : foundPokemon.type.en,
                info:
                    languageValue === "fr"
                        ? foundPokemon.info.fr
                        : languageValue === "en"
                          ? foundPokemon.info.en
                          : foundPokemon.info.en,
                id: foundPokemon.id,
                image: foundPokemon.image,
            },
        }),
    );
};

export const getAllPokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    /** TODO:
     * 1. Grab the language cookie from the request.
     * 2. Get the language from the cookie.
     * 3. Send the appropriate Pokemon data to the view based on the language.
     */

    // Cookies
    const cookies = getCookies(req);

    const defaultLanguage = "en";
    let languageValue = cookies["language"];

    if (!languageValue) {
        languageValue = defaultLanguage;
    }

    /*
    pokemon: { name: languageValue === "fr" ? foundPokemon.name.fr: languageValue === "en" ? foundPokemon.name.en: foundPokemon.name.en,
            type: languageValue === "fr" ? foundPokemon.type.fr: languageValue === "en" ? foundPokemon.type.en: foundPokemon.type.en,
            info: languageValue === "fr" ? foundPokemon.info.fr: languageValue === "en" ? foundPokemon.info.en: foundPokemon.info.en
            ,
            id: foundPokemon.id,
            image: foundPokemon.image       
        }
        */

    let languageMon = database.map((pokemon) => {
        return {
            name:
                languageValue === "fr"
                    ? pokemon.name.fr
                    : languageValue === "en"
                      ? pokemon.name.en
                      : pokemon.name.en,
            type:
                languageValue === "fr"
                    ? pokemon.type.fr
                    : languageValue === "en"
                      ? pokemon.type.en
                      : pokemon.type.en,
            info:
                languageValue === "fr"
                    ? pokemon.info.fr
                    : languageValue === "en"
                      ? pokemon.info.en
                      : pokemon.info.en,
            id: pokemon.id,
            image: pokemon.image,
        };
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(
        await renderTemplate("src/views/ListView.hbs", {
            title:
                languageValue === "fr"
                    ? "Liste de Pokemons!"
                    : languageValue === "en"
                      ? "List of Pokemon!"
                      : "List of Pokemon!",
            pokemon: languageMon,
        }),
    );
};

const parseBody = async (req: IncomingMessage) => {
    return new Promise<string>((resolve) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            resolve(body);
        });
    });
};

/**
 * @returns The cookies of the request as a Record type object.
 * @example name=Pikachu;type=Electric => { "name": "Pikachu", "type": "Electric" }
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie
 * @see https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
 */
const getCookies = (req: IncomingMessage): Record<string, string> => {
    /** TODO:
     * 1. Get the cookie header from the request.
     * 2. Parse the cookie header into a Record<string, string> object.
     *    - Split the cookie header by the semicolon.
     *    - Split each cookie by the equals sign.
     *    - Assign the name as the key and the value as the value.
     * 3. Return the object.
     */

    let cookieString = req.headers.cookie?.toString();

    let cookieRecord: Record<string, string> = {};

    if (cookieString) {
        let cookieParts = cookieString.split(";");

        cookieParts.forEach((keyVal) => {
            let keyValArray = keyVal.split("=");
            cookieRecord[keyValArray[0].trim()] = keyValArray[1].trim();
        });
    }

    return cookieRecord;
};
