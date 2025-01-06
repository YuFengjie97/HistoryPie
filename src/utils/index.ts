export function flatArray(arr: any[]) {
  const res: any[] = []
  for(const item of arr){
    if(Array.isArray(item)) {
      res.push(...flatArray(item))
    }else{
      res.push(item)
    }
  }
  return res
}

export function millisecondsToSeconds(milliseconds: number) {
  return Math.round(milliseconds / 1000);
}