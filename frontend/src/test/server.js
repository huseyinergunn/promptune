import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// handlers.js'deki tüm route'ları kullanarak sahte sunucu oluşturuluyor
export const server = setupServer(...handlers)