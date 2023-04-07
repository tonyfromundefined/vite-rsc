const REDIRECT_ERROR_CODE = "REDIRECT";

type RedirectError<U extends string> = Error & {
	digest: `${typeof REDIRECT_ERROR_CODE};${U}`;
};

/**
 * When used in a React server component, this will insert a meta tag to
 * redirect the user to the target page. When used in a custom app route, it
 * will serve a 302 to the caller.
 *
 * @param url the url to redirect to
 */
export function redirect(url: string): never {
	// eslint-disable-next-line no-throw-literal
	const error = new Error(REDIRECT_ERROR_CODE);
	(error as RedirectError<typeof url>).digest = `${REDIRECT_ERROR_CODE};${url}`;
	throw error;
}

/**
 * Checks an error to determine if it's an error generated by the
 * `redirect(url)` helper.
 *
 * @param error the error that may reference a redirect error
 * @returns true if the error is a redirect error
 */
export function isRedirectError<U extends string>(
	error: any,
): error is RedirectError<U> {
	return (
		typeof error?.digest === "string" &&
		error.digest.startsWith(REDIRECT_ERROR_CODE + ";") &&
		error.digest.length > REDIRECT_ERROR_CODE.length + 1
	);
}

/**
 * Returns the encoded URL from the error if it's a RedirectError, null
 * otherwise. Note that this does not validate the URL returned.
 *
 * @param error the error that may be a redirect error
 * @return the url if the error was a redirect error
 */
export function getURLFromRedirectError<U extends string>(
	error: RedirectError<U>,
): U;
export function getURLFromRedirectError(error: any): string | null;
export function getURLFromRedirectError(error: any): string | null {
	if (!isRedirectError(error)) return null;

	// Slices off the beginning of the digest that contains the code and the
	// separating ';'.
	return error.digest.slice(REDIRECT_ERROR_CODE.length + 1);
}