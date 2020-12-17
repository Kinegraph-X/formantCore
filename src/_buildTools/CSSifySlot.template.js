/**
 * Exportable template string: the execution is defered until calling the curryied function
 */

function defer([first, ...rest]) {
  return (...values) => rest.reduce((acc, str, i) => acc + values[i] + str, first);
}

module.exports = [
		defer`
	var ${null}Styles = [
/**@CSSifySlot styleSlotName : ${null} */
	];`,
		defer`
	var ${null}StylesUseCache = {
		use : ${null},
		nameInCache : '${null}Styles'
	}`,
		defer`,
				sWrapper : CreateStyle(
						${null}StylesUseCache.use ? ${null}StylesUseCache.nameInCache : null,
						null,
						${null}Styles
					).sWrapper`
	]