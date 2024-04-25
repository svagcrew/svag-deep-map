/* eslint-disable @typescript-eslint/ban-types */
import cloneDeep from 'lodash/cloneDeep'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'

type ReplaceFn = ({ path, key, value }: { path: string; key: string; value: Value }) => Value
type Value = Object | number | string | boolean | null | undefined | Function | Symbol | any[]

const recursion = ({
  input,
  replaceFn,
  seen,
  pathStartsWith,
  parentKey,
}: {
  input: Value
  replaceFn: ReplaceFn
  seen: WeakSet<any>
  pathStartsWith: string
  parentKey: string
}): Value => {
  if (['object', 'function', 'symbol'].includes(typeof input) && input !== null) {
    if (seen.has(input)) {
      return '!!!CIRCULAR!!!'
    } else {
      seen.add(input)
    }
  }
  const result = replaceFn({ path: pathStartsWith.replace(/\.$/, ''), key: parentKey, value: input })
  if (!result) {
    return result
  }
  if (isArray(result)) {
    return result.map((item, index) =>
      recursion({
        input: item,
        replaceFn,
        seen,
        pathStartsWith: `${pathStartsWith}${index}.`,
        parentKey: index.toString(),
      })
    )
  }
  if (isObject(result)) {
    const object: any = {}
    for (const [key, value] of Object.entries(result)) {
      object[key] = recursion({
        input: value,
        replaceFn,
        seen,
        pathStartsWith: `${pathStartsWith}${key}.`,
        parentKey: key,
      })
    }
    return object
  }
  return result
}

export const deepMap = <T = Value>(input: Value, replaceFn: ReplaceFn): T => {
  const seen = new WeakSet()
  const clonedInput = cloneDeep(input)
  const mappedObject = recursion({ input: clonedInput, replaceFn, seen, pathStartsWith: '', parentKey: '' })
  return mappedObject as T
}
