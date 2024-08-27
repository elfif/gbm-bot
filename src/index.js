const { FixedNumber } = require('ethers')
const data = require('./auctions')
const fs = require('fs')

function main() {
    let total = BigInt(0)
    let count = 0
    const wei = FixedNumber.fromValue("1000000000000000000")
    const file = `listings_${new Date().getTime()}.csv`
    const header = 'id, orderId, tokenId, type, endsAt, cancelled, category, highestBidder, highestBid,  claimed, totalBids, totalBidsVolume, platformFees, gbmFees, royaltyFees, sellerProceeds\r\n'
    fs.appendFileSync(file, header)   
 

    for ( const auction of data.data ) {
        count ++
        total = total + BigInt(auction.sellerProceeds)
        const highestBid = FixedNumber.fromValue(auction.highestBid.toString(), {decimals: 4, signed: false, width: 64})
        const totalBidsVolume = FixedNumber.fromValue(auction.totalBidsVolume.toString(), {decimals: 4, signed: false, width: 64})
        const platformFees = FixedNumber.fromValue(auction.platformFees.toString(), {decimals: 4, signed: false, width: 64})
        const gbmFees = FixedNumber.fromValue(auction.gbmFees.toString(), {decimals: 4, signed: false, width: 64})
        const royaltyFees = FixedNumber.fromValue(auction.royaltyFees.toString(), {decimals: 4, signed: false, width: 64})
        const sellerProceeds = FixedNumber.fromValue(auction.sellerProceeds.toString(), {decimals: 4, signed: false, width: 64})
        
        const line = `${auction.id},${auction.orderId},${auction.tokenId},${auction.type},${auction.endsAt},${auction.cancelled},${auction.category},${auction.highestBidder},${highestBid},${auction.claimed},${auction.totalBids},${totalBidsVolume},${platformFees},${gbmFees},${royaltyFees},${sellerProceeds} \r\n`
        fs.appendFileSync(file, line)
    }
    console.log(total, count)
}

main()