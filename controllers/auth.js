import { sql } from "../db.js"
import bcrypt from 'bcryptjs'
import { generateAccessToken } from "../utils/generateToken.js"

//авторизация
export const auth = async (req, res) => {
    //вытаскиваем json и сразу вытаскиваем из нее переменные
    const { username, password } = req.body 
    //вытаскиваем из базы пользователя
    const user = await sql`select * from Users where name = ${username}`
    //если нет то выкидываем ошибку
    if (!user[0]) {
        return res.status(400).json({ message: `Пользователь ${username} не найден` })
    }
    //сверяем пароли
    const validPassword = bcrypt.compareSync(password, user[0].password)
    //если не совпадают то ошибку прокидываем
    if (!validPassword) {
        return res.status(400).json({ message: `Введен неверный пароль` })
    }
    //если все ок то генерируем токен
    const token = generateAccessToken(user[0].id, user[0].role)
    //и возвращаем пользователю токен и его данные из базы
    return res.json({
        token: token,
        user: user[0]
    })
}