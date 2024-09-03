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
	const [seconds, setSeconds] = useState<number>();
	const [loading, setLoading] = useState<boolean>(false);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [location, setLocation] = useState<string>('all');
	const [type, setType] = useState<string>('all');
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<IInfo>();
	const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(false);

	const handleFetchLocations = async () => {
		try {
			const response = await axios({
				method: 'GET',
				url: `${API_URL}/location`,
			})
			const data = response.data.data.countries || [];
			console.log(`data`, data);
			setLocations(data);
		} catch (error) {
			console.log(`error`, error);
		}
	};
	console.log(`error`, error);

	const handleRenewProxy = async () => {
		setLoading(true);
		try {
			const response = await axios({
				method: 'GET',
				url: `${API_URL}/getNewProxy`,
				params: {
					apiKey,
					location: location === 'all' ? undefined : location,
					type: type === 'all' ? undefined : type,
				}
			});
			console.log(`response`, response);
			setInfo(response.data.data);
			if (response.data.success === false && response.data.message.includes('You can get new proxy in')) {
				setError(response.data.message);
			} else {
				setError(null);
			}
			setIsConnected(true);
			// set value to local storage
			localStorage.setItem('proxy', JSON.stringify(response.data.data));
			localStorage.setItem('apiKey', apiKey);
			localStorage.setItem('location', location || 'all');
			localStorage.setItem('type', type);
			// send message to background
			chrome.runtime.sendMessage({
				type: 'proxy_info',
				data: response.data.data
			}, (response) => {
				console.log(`Response from background:`, response);
			});
		} catch (error) {
			console.log(`error`, error);
			setError(error?.response?.data?.message || 'Có lỗi xảy ra');
			setIsConnected(false);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		handleFetchLocations();
	}, []);

	useEffect(() => {
		const proxy = localStorage.getItem('proxy');
		const apiKey = localStorage.getItem('apiKey');
		const location = localStorage.getItem('location');
		const type = localStorage.getItem('type');
		const savedIsAutoRefresh = localStorage.getItem('isAutoRefresh');
		const savedSeconds = localStorage.getItem('seconds');
		if (proxy) {
			setInfo(JSON.parse(proxy));
			setApiKey(apiKey || '');
			setLocation(location || 'all');
			setType(type || 'all');
			setIsConnected(true);
		}
		if (savedIsAutoRefresh !== null) {
			setIsAutoRefresh(savedIsAutoRefresh === 'true');
		}

		if (savedSeconds !== null) {
			setSeconds(Number(savedSeconds) || 60);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('isAutoRefresh', isAutoRefresh?.toString());
	}, [isAutoRefresh]);

	useEffect(() => {
		localStorage.setItem('seconds', seconds?.toString());
	}, [seconds]);

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
				<div className="flex-1">
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
										<Tag color="yellow">
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
											<Input placeholder="Refresh at" value={info?.nextChange} disabled={true} />
										</Col>
									</Row>
									<Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
										<Col span={6}>
											<span>Location:</span>
										</Col>
										<Col span={18}>
											<Input placeholder="Location" value={info?.country} disabled={true} />
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
									Auto refresh IP:
								</span>
							</Col>
							<Col span={4}>
								<Switch onChange={(checked) => setIsAutoRefresh(checked)} value={isAutoRefresh} />
							</Col>
							<Col span={14} className="flex justify-end items-center gap-2">
								<Tooltip title={'Save'}>
									<Button type="default" icon={<SaveOutlined />} />
								</Tooltip>
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
							<Col span={6}>
								<span>API Key</span>
							</Col>
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
						<Col span={24} className="flex justify-between gap-2">
							<ConfigProvider
								theme={{
									token: {
										colorPrimary: '#1677ff',
									},
								}}
							>
								<Button type="primary" href="https://netproxy.io/" target="_blank">Buy Proxy</Button>
							</ConfigProvider>
							<Button type="primary" onClick={handleRenewProxy} disabled={isConnected ? true : false}>Connect</Button>
							<ConfigProvider
								theme={{
									token: {
										colorPrimary: '#7cb305',
									},
								}}
							>
								<Button type="primary" onClick={handleRenewProxy} disabled={isConnected ? false : true}>Change IP</Button>
							</ConfigProvider>
							<Button type="primary" danger disabled={isConnected ? false : true}>
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