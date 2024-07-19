import capitalize from "lodash.capitalize";


export function capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function maskFullName(firstName: string, lastName: string) {
    let displayName = capitalize(firstName);
    if (lastName) {
        displayName += ` ${lastName.charAt(0).toUpperCase()}.`;
    }
    return displayName
}