export const waitForMillis = async (millis: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, millis);
    });
}