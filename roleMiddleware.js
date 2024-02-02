import jwt from 'jsonwebtoken'

//промежуточная функция между запросом
//запускается до того как запрос дойдет до основной функции
//принимаем аргументом массив ролей оступа
export const roleMiddleware = (roles) => {
    return (req, res, next) => {    
        //если метод запроса options то просто ничего не делаем
        if (req.method === "OPTIONS") next()
        
        try {
            //из запроса достаешь токен
            const token = req.headers.authorization.split(' ')[1]
            //если в запросе нет токена возвращаем сразу пользователю ошибку и говоорим что он не авторизирован
            if (!token) {
                return res.status(403).send({message: "Пользователь не авторизован"})
            }
            //далее вытаскаиваем данные из токена которые мы записывали
            const {role: userRole} = jwt.verify(token, "SECRET_KEY")

            //проверяем есть ли у пользовтеля доступ к ветке проверяя есть ли его роль в массиве ролей
            let hasRole = false
            roles.forEach(role => {
                if (role == userRole) {
                    hasRole = true
                }
            })
            //если нет подходящей роли то возвращаем ошибку
            if (!hasRole) {
                return res.status(403).json({message: "У вас нет доступа"})
            }
            //в итоге если все валидации проходим то просто передаем доступ к запросу основной функции
            next()
        } catch (error) {
            //если произошла ошибка то выкидываем ее пользователю
            console.log(error)
            return res.status(403).json({ message: "Пользователь не авторизован" })
        }
    }
}