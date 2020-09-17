import { CommandType } from '../interfaces'

const CUSTOM_COMMANDS = ['cd', 'ls']

const getCommandType = (input: string): CommandType =>
  CUSTOM_COMMANDS.includes(input.split(' ')[0]) ? 'custom' : 'default'

export default getCommandType
