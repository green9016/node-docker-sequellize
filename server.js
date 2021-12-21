// env config
require("dotenv").config();

// db config
const db = require("./app/models");
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Transaction = db.transactions;
sequelize.sync();

// json to transaction model.
const createTransaction = (t) => ({
  involvesWatchOnly: t.involvesWatchonly,
  account: t.account,
  address: t.address,
  category: t.category,
  amount: t.amount,
  label: t.label,
  confirmations: t.confirmations,
  blockhash: t.blockhash,
  blockindex: t.blockindex,
  blocktime: t.blocktime,
  txid: t.txid,
  vout: t.vout,
  walletconflicts: t.walletconflicts,
  time: t.time,
  timereceived: t.timereceived,
  bip125_replaceable: t["bip125-replaceable"]
});

// clear all transactions from db
const clearAllDb = () => {
  return Transaction.destroy({
    where: {},
    truncate: false
  });
}

const insertTransactions = (transactions) => {
  return Promise.all(
    transactions.map(t => {
      // filter only deposit transactions
      if (t.category == "receive") {
        return Transaction.create(createTransaction(t))
      }
      return null;
    })
    .filter(v => v)
  );
}

const outputResult = async () => {
  // get 
  const customers = [
    {
      name: "Wesley Crusher",
      address: "mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ"
    },
    {
      name: "Leonard McCoy",
      address: "mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp"
    },
    {
      name: "Jonathan Archer",
      address: "mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n"
    },
    {
      name: "Jadzia Dax",
      address: "2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo"
    },
    {
      name: "Montgomery Scott",
      address: "mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8"
    },
    {
      name: "James T. Kirk",
      address: "miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM"
    },
    {
      name: "Spock",
      address: "mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV"
    }
  ];
  const custommerAddresses = customers.map(v => v.address);

  // respective data.
  const respectiveData = await Transaction.findAll({
    attributes: [
      "address",
      [db.sequelize.fn("count", db.sequelize.col("address")), "count"],
      [db.sequelize.fn("sum", db.sequelize.col("amount")), "amount"]
    ],
    where: {
      address: {
        [Op.in]: custommerAddresses
      },
      confirmations: {
        [Op.gt]: 6
      }
     },
    group: ["address"]
  });

  const extraData = await Transaction.findOne({
    attributes: [
      [db.sequelize.fn("count", db.sequelize.col("address")), "count"],
      [db.sequelize.fn("sum", db.sequelize.col("amount")), "amount"]
    ],
    where: {
      address: {
        [Op.notIn]: custommerAddresses
      },
      confirmations: {
        [Op.gt]: 6
      }
     },
  });

  // smallest and largest deposit
  const minMaxData = await Transaction.findOne({
    attributes: [
      [db.sequelize.fn("min", db.sequelize.col("amount")), "smallest"],
      [db.sequelize.fn("max", db.sequelize.col("amount")), "largest"]
    ],
    where: {
      confirmations: {
        [Op.gt]: 6
      }
     },
  });

  // Output the result.
  const repectiveResult = respectiveData?.reduce((acc, t) => {
    acc[t.dataValues.address] = t.dataValues;
    return acc;
  }, {});
  customers.map(c => {
    const result = repectiveResult[c.address];
    const { count = 0, amount = 0 } = result || {};
    console.log(`Deposited for ${c.name}: count=${count} sum=${amount}`);
  })
  
  const { count = 0, amount = 0 } = extraData?.dataValues || {};
  console.log(`Deposited without reference: count=${count} sum=${amount}`);

  const { smallest = 0, largest = 0 } = minMaxData?.dataValues || {};
  console.log(`Smallest valid deposit: ${smallest}`);
  console.log(`Largest valid deposit: ${largest}`);
}

const run = async () => {
  await clearAllDb();

  const transactionFile1 = require("./data/transactions-1.json");
  const transactionFile2 = require("./data/transactions-2.json");
  await insertTransactions(transactionFile1.transactions);
  await insertTransactions(transactionFile2.transactions);

  await outputResult();
}

run();