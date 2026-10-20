/** Raised when a request carries an invalid parameter: the API answers 400 */
export class InvalidInputError extends Error {
	name = 'InvalidInputError';
}

/** Raised when a D1 query fails: the API answers 503 */
export class DatabaseError extends Error {
	name = 'DatabaseError';
}

/** Raised when a new plugin takes the id of an existing one: the API answers 409 */
export class ConflictError extends Error {
	name = 'ConflictError';
}
