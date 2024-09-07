import { SaveOutlined } from "@ant-design/icons";
import { Button, Col, ConfigProvider, Input, InputNumber, Row, Select, Switch, Tag, Tooltip } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import './popup.css';
import Footer from "./components/Footer";
import Header from "./components/Header";

const API_URL = 'https://api.netproxy.io/api/rotateProxy';
interface IInfo {
	proxy: string;
	refreshAt: string;
	nextChange: number;
	acceptIp: string;
	isResidential: boolean;
	country: string;
}

const Popup = () => {
	const [locations, setLocations] = useState<string[]>([]);
	const [apiKey, setApiKey] = useState<string | null>('');
	const [seconds, setSeconds] = useState<number | null>(60);
	const [loading, setLoading] = useState<boolean>(false);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [location, setLocation] = useState<string>('all');
	const [type, setType] = useState<string>('all');
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<IInfo>();
	const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(false);
	const [countDown, setCountDown] = useState<number>(0);
	const [timeRefresh, setTimeRefresh] = useState<number>(0);

	const handleFetchLocations = async () => {
		try {
			const response = await axios({
				method: 'GET',
				url: `${API_URL}/location`,
			})
			const data = response.data.data.countries || [];
			setLocations(data);
		} catch (error) {
			console.log(`error`, error);
		}
	};

	const handleFetchCurrentProxy = async () => {
		setLoading(true);
		const apiKey = localStorage.getItem('apiKey') || '';
		const isConnected = localStorage.getItem('isConnected') === 'true' ? true : false;
		try {
			if (!apiKey || !isConnected ) {
				setError('Please input API Key');
				setLoading(false);
				setIsConnected(false);
				console.log(`error`, 'Please input API Key');
				return;
			}
			const response = await axios({
				method: 'GET',
				url: `${API_URL}/getCurrentProxy`,
				params: {
					apiKey,
				}
			});
			setInfo(response.data.data);
			setTimeRefresh(response.data.data.nextChange || 0);
			setIsConnected(true);
		} catch (error) {
			console.log(`error`, error);
			setError(error?.response?.data?.message || 'Có lỗi xảy ra');
			setIsConnected(false);
			setInfo(null);
			localStorage.removeItem('isConnected');
			localStorage.removeItem('proxy');
			chrome.runtime.sendMessage({
				type: 'proxy_disconnect',
			});
		} finally {
			setLoading(false);
		}
	}

	const handleRenewProxy = async () => {
		setLoading(true);
		try {
			const response = await axios({
				method: 'GET',
				url: `${API_URL}/getNewProxy`,
				params: {
					apiKey,
					country: location === 'all' ? undefined : location,
					type: type === 'all' ? undefined : type,
				}
			});
			setInfo(response.data.data);
			setTimeRefresh(response.data.data.nextChange || 0);
			setIsConnected(true);
			if (response.data.success === false && response.data.message.includes('You can get new proxy in')) {
				setError(response.data.message);
				localStorage.setItem('apiKey', apiKey);
				localStorage.setItem('location', location || 'all');
				localStorage.setItem('type', type);
				localStorage.setItem('isConnected', 'true');
				chrome.runtime.sendMessage({
					type: 'proxy_connect',
					data: {
						...response.data.data,
						newTab: response?.data?.message?.includes('You can get new proxy in') ? false : true
					}
				});
				return;
			}
			chrome.runtime.sendMessage({
				type: 'proxy_connect',
				data: {
					...response.data.data,
					newTab: response?.data?.message?.includes('You can get new proxy in') ? false : true
				}
			});
			setError(null);
			// set value to local storage
			localStorage.setItem('apiKey', apiKey);
			localStorage.setItem('location', location || 'all');
			localStorage.setItem('type', type);
			localStorage.setItem('isConnected', 'true');
		} catch (error) {
			console.log(`error`, error);
			setError(error?.response?.data?.message || 'Có lỗi xảy ra');
			setIsConnected(false);
			setInfo(null);
			localStorage.removeItem('isConnected');
			chrome.runtime.sendMessage({
				type: 'proxy_disconnect',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDisconnectProxy = async () => {
		try {
			setIsConnected(false);
			setInfo(null);
			setIsAutoRefresh(false);
			localStorage.setItem('isConnected', 'false');
			localStorage.removeItem('proxy');
			localStorage.removeItem('isAutoRefresh');
			chrome.runtime.sendMessage({
				type: 'proxy_disconnect',
			});
		} catch (error) {
			console.log(`error`, error);
		}
	};

	const handleSaveAutoRefresh = async () => {
		try {
			if (!isConnected) {
				setError('Please connect to proxy first');
				return;
			}
			setIsAutoRefresh(true);
			localStorage.setItem('isAutoRefresh', 'true');
			localStorage.setItem('seconds', seconds.toString());
			await chrome.runtime.sendMessage({
				type: 'proxy_autoChangeIp',
				data: {
					timeRefresh: seconds,
					apiKey,
					country: location,
					type,
					isAutoRefresh: true,
					isConnected
				}
			});
		} catch (error) {
			console.log(`error`, error);
		}
	};

	const handleStopAutoRefresh = async (value: boolean) => {
		if (!value) {
			setIsAutoRefresh(false);
			localStorage.setItem('isAutoRefresh', 'false');
			await chrome.runtime.sendMessage({
				type: 'proxy_stopAutoChangeIp',
				data: {}
			});
			return;
		} else {
			setIsAutoRefresh(true);
			localStorage.setItem('isAutoRefresh', 'true');
			localStorage.setItem('seconds', seconds.toString());
			await chrome.runtime.sendMessage({
				type: 'proxy_autoChangeIp',
				data: {
					timeRefresh: seconds,
					apiKey,
					country: location,
					type,
					isAutoRefresh: true,
					isConnected
				}
			});
		}
	};

	useEffect(() => {
		handleFetchLocations();
		handleFetchCurrentProxy();
	}, []);

	useEffect(() => {
		const apiKey = localStorage.getItem('apiKey') || '';
		const location = localStorage.getItem('location');
		const type = localStorage.getItem('type');
		const savedIsAutoRefresh = localStorage.getItem('isAutoRefresh');
		const savedSeconds = localStorage.getItem('seconds');
		const isConnected = localStorage.getItem('isConnected');
		setApiKey(apiKey || '');
		setLocation(location || 'all');
		setType(type || 'all');
		if (savedIsAutoRefresh !== null) {
			setIsAutoRefresh(savedIsAutoRefresh === 'true');
		}
		if (savedSeconds !== null) {
			setSeconds(Number(savedSeconds) || 60);
		}
		if (isConnected === 'true') {
			setIsConnected(true);
		}
	}, []);

	useEffect(() => {
		const messageListener = (message) => {
			if (message.type === 'proxy_autoChangeIp_result') {
				console.log('Received new proxy result:', message.data.data);
				setInfo(message.data.data);
				setTimeRefresh(message.data.data.nextChange || 0);
				setIsConnected(true);
			}
		};
		chrome.runtime.onMessage.addListener(messageListener);
		return () => {
			chrome.runtime.onMessage.removeListener(messageListener);
		};
	}, []);

	useEffect(() => {
		const messageListener = (message) => {
			if (message.type === 'proxy_autoChangeIp_countdown') {
				setCountDown(message?.data);
			}
		};
		chrome.runtime.onMessage.addListener(messageListener);
		return () => {
			chrome.runtime.onMessage.removeListener(messageListener);
		};
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (timeRefresh > 0) {
				setTimeRefresh(timeRefresh - 1);
				localStorage.setItem('timeRefresh', timeRefresh.toString());
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [timeRefresh]);
	return (
		<>
			<Header />
			<ConfigProvider
				theme={{
					token: {
						colorPrimary: '#f6892f',
					},
				}}
			>
				<div className="flex-1 w-full">
					<div className="p-4">
						<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
							<Col span={6}>
								<span>Status:</span>
							</Col>
							<Col span={18}>
								{
									isConnected ? (
										<Tag color="green">
											Connected
										</Tag>
									) : (
										<Tag color="red">
											Disconnected
										</Tag>
									)
								}
							</Col>
						</Row>
						{
							info && (
								<>
									<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
										<Col span={6}>
											<span>Host:</span>
										</Col>
										<Col span={18}>
											<Input placeholder="Host" value={info?.proxy?.split(':')[0]} disabled={true} />
										</Col>
									</Row>

									<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
										<Col span={6}>
											<span>Port:</span>
										</Col>
										<Col span={18}>
											<Input placeholder="Port" value={info?.proxy?.split(':')[1]} disabled={true} />
										</Col>
									</Row>
									<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
										<Col span={6}>
											<span>
												Refresh at:
											</span>
										</Col>
										<Col span={18}>
											<Input placeholder="Refresh at" value={`${timeRefresh} s`} className='text-green-700' />
										</Col>
									</Row>
									<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
										<Col span={6}>
											<span>Location:</span>
										</Col>
										<Col span={18}>
											<Input value={info?.country ? info?.country : ''} disabled={true} />
										</Col>
									</Row>
									<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
										<Col span={6}>
											<span>Residential:</span>
										</Col>
										<Col span={18}>
											{
												info?.isResidential ? (
													<Tag color="green">Residential</Tag>
												) : (
													<Tag color="blue">Datacenter</Tag>
												)
											}
										</Col>
									</Row>
								</>
							)
						}
						<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
							<Col span={6}>
								<span>
									Auto change:
								</span>
							</Col>
							<Col span={4} className="flex flex-row items-center gap-2">
								<Switch onChange={(checked) => handleStopAutoRefresh(checked)} value={isAutoRefresh} />
								<span className="font-bold">{countDown}</span>
							</Col>
							<Col span={14} className="flex justify-end items-center gap-2">
								<Button type="default" onClick={handleSaveAutoRefresh}>Lưu</Button>
								<InputNumber min={60} defaultValue={60}
									onChange={(value) => setSeconds(value)}
									value={seconds} />
								<span>(s)</span>
							</Col>
						</Row>
						<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
							<Col span={12}>
								<div className="flex flex-col w-full gap-4">
									<span>Location:</span>
									<Select
										value={location || 'all'}
										showSearch
										className="w-full"
										dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
										onChange={(value) => setLocation(value)}
									>
										<Select.Option value="all">All</Select.Option>
										{locations?.map((location, index) => (
											<Select.Option key={index} value={location}>{location}</Select.Option>
										))}
									</Select>
								</div>
							</Col>
							<Col span={12}>
								<div className="flex flex-col w-full gap-4">
									<span>Type:</span>
									<Select
										value={type || 'all'}
										showSearch
										className="w-full"
										onChange={(value) => setType(value)}
									>
										<Select.Option value="all">All</Select.Option>
										<Select.Option value="residential">Residential</Select.Option>
										<Select.Option value="datacenter">Datacenter</Select.Option>
									</Select>
								</div>
							</Col>
						</Row>
						<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
							<Col span={24}>
								<Input value={apiKey} placeholder="Input API Key" onChange={(e) => setApiKey(e.target.value)} />
							</Col>
							{
								error && (
									<span style={{
										color: 'red',
										padding: '0 8px'
									}}>
										{error}
									</span>
								)
							}
						</Row>
						<Col span={24} className="flex justify-end gap-2">
							<Button type="primary" onClick={handleRenewProxy} disabled={isConnected ? true : false} loading={!isConnected && loading ? true : false}>Connect</Button>
							<ConfigProvider
								theme={{
									token: {
										colorPrimary: '#7cb305',
									},
								}}
							>
								<Button type="primary" onClick={handleRenewProxy} disabled={isConnected ? false : true} loading={isConnected && loading ? true : false}>Change IP</Button>
							</ConfigProvider>
							<Button type="primary" danger disabled={isConnected ? false : true} onClick={handleDisconnectProxy}>
								Disconnect
							</Button>
						</Col>
					</div>
				</div>
			</ConfigProvider>
			<Footer />
		</>
	)
};

export default Popup;