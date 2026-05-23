export const msg = (...msgs: unknown[]) => {
  const time = new Date().toLocaleString().split(" ")[1]
  console.log(`${time}|`, ...msgs)
}
