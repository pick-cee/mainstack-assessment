import bcrypt from 'bcrypt'

export async function passwordHash(data: string) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(data, salt)
    return hash
}

export async function passwordCompare(password: string, hashPassword: string) {
    const isMatch = await bcrypt.compare(password, hashPassword)
    return isMatch
}