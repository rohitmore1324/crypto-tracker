import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllAssets } from '../../features/crypto/cryptoSelectors';
import { startMockWebSocket } from '../../features/websocket/mockWebSocket';
import styles from './CryptoTable.module.css';

const CryptoTable = () => {
    const assets = useSelector(selectAllAssets);
    const dispatch = useDispatch();

    useEffect(() => {
        startMockWebSocket(dispatch);
    }, [dispatch]);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.cryptoTable}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>1h %</th>
                        <th>24h %</th>
                        <th>7d %</th>
                        <th>Market Cap</th>
                        <th>24h Volume</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset, index) => (
                        <tr key={asset.id}>
                            <td>{index + 1}</td>
                            <td>
                                <div className={styles.assetName}>
                                    <img
                                        src={`https://cryptologos.cc/logos/${asset.id}-${asset.symbol.toLowerCase()}-logo.png`}
                                        alt={asset.name}
                                        width="24"
                                    />
                                    <span>{asset.name}</span>
                                    <span className={styles.symbol}>{asset.symbol}</span>
                                </div>
                            </td>
                            <td>${asset.price.toLocaleString()}</td>
                            <td className={asset.change1h >= 0 ? styles.positive : styles.negative}>
                                {asset.change1h > 0 ? '+' : ''}{asset.change1h}%
                            </td>
                            <td className={asset.change24h >= 0 ? styles.positive : styles.negative}>
                                {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                            </td>
                            <td className={asset.change7d >= 0 ? styles.positive : styles.negative}>
                                {asset.change7d > 0 ? '+' : ''}{asset.change7d}%
                            </td>
                            <td>${asset.marketCap.toLocaleString()}</td>
                            <td>${asset.volume24h.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CryptoTable;