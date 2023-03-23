const listing = require("./listing")
const abi = require('./abis/gbm-abi')
const ethers = require('ethers')

function getSigner(provider) {
    let account1 = ethers.HDNodeWallet.fromPhrase("put your seed phrase here")
    account1 = account1.connect(provider)
    return account1
}

function getProvider() {
    const rpc = "https://polygon-rpc.com"
    const network = new ethers.Network("MATIC", 137)
    const provider = new ethers.JsonRpcProvider(rpc, network)
    return provider
}

function getContract(provider, signer) {
    let contract = new ethers.BaseContract("0xD5543237C656f25EEA69f1E247b8Fa59ba353306", abi.data, signer)
    return contract
}

async function getSignature(account, auctionId, bid, prevBid) {
    console.log("{\"currentAccount\":\""+account+"\",\"auctionId\":\""+auctionId+"\",\"bidAmountString\":\""+bid+"\",\"highestBid\":\""+prevBid+"\":\"0\"}")
    const response = await fetch("https://auction.aavegotchi.com/api/signBid", {
        "headers": {
          "accept": "*/*",
          "accept-language": "fr-FR,fr;q=0.9",
          "content-type": "application/json",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "Referer": "https://auction.aavegotchi.com/auction/0x4fDfc1B53Fd1D80d969C984ba7a8CE4c7bAaD442?id=7679",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"currentAccount\":\""+account+"\",\"auctionId\":\""+auctionId+"\",\"bidAmountString\":\""+bid+"\",\"highestBid\":\""+prevBid+"\"}",
        "method": "POST"
      });
    const json = await response.json()
    let signature = "0x"
    Object.entries(json.signature).forEach(i => {
        let h = i[1].toString(16)
        if (h.length === 1) {
            h = "0"+h
        }
        signature += h
    })
    return signature
}

async function main(){

    const provider = getProvider()
    const signer = getSigner(provider)
    const contract = getContract(provider, signer)

    for(let l of listing.auctions) {
        const sig  = await getSignature(
            signer.address,
            l.id,
            "850000000000000000",
            l.highestBid
        )  
        console.log(sig)
        try {
            const tx = await contract.commitBid(
                BigInt(l.id),
                BigInt("850000000000000000"),
                BigInt(l.highestBid),
                "0x4fDfc1B53Fd1D80d969C984ba7a8CE4c7bAaD442",
                BigInt(l.tokenId),
                BigInt(1),
                sig,
                {gasPrice: 250000000000}
            )
            console.log(tx.hash)
            await tx.wait()
            console.log(tx.response)
        } catch (e) {
            console.log(e)
        }
        await new Promise(r => setTimeout(r, 500));
    }
}

main().then(() => {
    console.log('done')
    process.exit()
})