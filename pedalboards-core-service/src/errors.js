/** Raised when a request carries an invalid parameter: the API answers 400 */
export class InvalidInputError extends Error {
	name = 'InvalidInputError';
}

/** Raised when a D1 query fails: the API answers 503 */
export class DatabaseError extends Error {
	name = 'DatabaseError';
}
