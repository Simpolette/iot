const bcrypt = require('bcrypt') ; // if its not work, try require('bcrypt')
const saltRounds = 10;

export const hashPassword = async(plainPassword: string) => {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
}

export const comparePassword = async(plainPassword: string, hashedPassword: string) => {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('Error comparing password:', error);
    }
}