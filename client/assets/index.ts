const getAsset = async () => {
    const local = (await import("./1337.json")).default
    const ropsten = (await import("./3.json")).default
    // const rinkeby = (await import("./4.json")).default
    return ({
        1337: local,
        3: ropsten,
        // 4: rinkeby,
    })
}

export default getAsset

export {}
