import { hashPassword, comparePassword } from '../../../src/utils/hash';
import bcrypt from 'bcrypt';

describe('Password Hashing and Comparison', () => {

    describe('hashPassword', () => {
        it('should return a hashed password string', async () => {
            const password = 'mySecurePassword123';
            const hashedPassword = await hashPassword(password);

            // Check that the output is a string
            expect(typeof hashedPassword).toBe('string');

            // Check that the output is not the same as the input
            expect(hashedPassword).not.toBe(password);
        });

        it('should produce a valid bcrypt hash', async () => {
            const password = 'mySecurePassword123';
            const hashedPassword = await hashPassword(password);

            // A simple way to check if it's a bcrypt hash is to see if compare succeeds
            const isMatch = await bcrypt.compare(password, hashedPassword);
            expect(isMatch).toBe(true);
        });
    });

    describe('comparePassword', () => {
        it('should return true for a correct password', async () => {
            const password = 'mySecurePassword123';
            const hashedPassword = await hashPassword(password);
            const isMatch = await comparePassword(password, hashedPassword);
            expect(isMatch).toBe(true);
        });

        it('should return false for an incorrect password', async () => {
            const password = 'mySecurePassword123';
            const hashedPassword = await hashPassword(password);
            const isMatch = await comparePassword('wrongPassword', hashedPassword);
            expect(isMatch).toBe(false);
        });
    });
});

