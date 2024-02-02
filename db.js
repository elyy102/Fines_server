import postgres from 'postgres'

//подключение к базе данных
export const sql = postgres({
    host: '192.168.147.50',
    port: 5432,
    db: 'mariia1604',
    username: 'mariia1604',
    password: '*Cm2b8t30r3'
})