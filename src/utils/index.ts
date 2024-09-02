import { message } from "antd"


export const handleCopy = (text: string) => {
  message.open({
    type: 'success',
    content: text,
    duration: 2,
  })
}