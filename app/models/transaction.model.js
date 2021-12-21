module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    involvesWatchOnly: { type: Sequelize.BOOLEAN },
    account: { type: Sequelize.STRING },
    address: { type: Sequelize.STRING },
    category: { type: Sequelize.STRING },
    amount: { type: Sequelize.DOUBLE },
    label: { type: Sequelize.STRING },
    confirmations: { type: Sequelize.INTEGER },
    blockhash: { type: Sequelize.STRING },
    blockindex: { type: Sequelize.INTEGER },
    blocktime: { type: Sequelize.DATE },
    txid: { type: Sequelize.STRING },
    vout: { type: Sequelize.INTEGER },
    walletconflicts: { type: Sequelize.JSON },
    time: { type: Sequelize.DATE },
    timereceived: { type: Sequelize.DATE },
    bip125_replaceable: { type: Sequelize.STRING },
  });

  return Transaction;
};
