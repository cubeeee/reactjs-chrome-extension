import React, { useEffect, useState } from "react";
import './popup.css'
import { Button, Col, ConfigProvider, Form, Input, InputNumber, Row, Select, Space, Switch, Tag, Tooltip } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import axios from "axios";

const API_URL = 'https://api.netproxy.io/api/rotateProxy';
interface IInfo {
  proxy: string;
  refreshAt: string;
  nextChange: number;
  acceptIp: string;
  isResidential: boolean;
}

const Popup = () => {
  const [locations, setLocations] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string | null>('');
  const [seconds, setSeconds] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<IInfo>();

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
      if (response.data.success === false) {
        setError(response.data.message );
      } else {
        setError(null);
      }
      setIsConnected(true);
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

  return (
    <>
      <header className="w-[420px] py-3 bg-orange-50">
        <div className="flex flex-col gap-2 items-center">
          <div className="w-auto h-10">
            <img alt="Netproxy" className="w-full h-full object-contain" src={'/logo.svg'} />
          </div>
          <div className="text-lg text-center px-2 font-semibold">
            Proxy dân cư Việt Nam đảm bảo chất lượng{" "}
          </div>
        </div>
      </header>
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
                <span>Trạng thái:</span>
              </Col>
              <Col span={18}>
                {
                  isConnected ? (
                    <Tag color="green">Đang kết nối</Tag>
                  ) : (
                    <Tag color="yellow">Chưa kết nôi</Tag>
                  )
                }
              </Col>
            </Row>
            {
              info && (
                <>
                  {/* <Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
                    <Col span={6}>
                      <span>Địa chỉ IP:</span>
                    </Col>
                    <Col span={18}>
                      <Input placeholder="IP Address" value={info?.proxy?.split(':')[0]}/>
                    </Col>
                  </Row> */}
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
                      <span>Thời gian đếm ngược:</span>
                    </Col>
                    <Col span={18}>
                      <Input placeholder="Thời gian đếm ngược" value={info?.nextChange} disabled={true} />
                    </Col>
                  </Row>
                </>
              )
            }


            <Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
              <Col span={6}>
                <span>Tự đông kết đổi IP:</span>
              </Col>
              <Col span={4}>
                <Switch />
              </Col>
              <Col span={14} className="flex justify-end items-center gap-2">
                <Tooltip title={'Lưu'}>
                  <Button type="default" icon={<SaveOutlined />} />
                </Tooltip>
                <InputNumber min={1} defaultValue={3} />
                <span>giây(s)</span>
              </Col>
            </Row>
            <Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
              <Col span={12}>
                <div className="flex flex-col w-full gap-4">
                  <span>Quốc gia:</span>
                  <Select
                    defaultValue="all"
                    showSearch
                    className="w-full"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  >
                    <Select.Option value="all">Tất cả</Select.Option>
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
                    defaultValue="all"
                    showSearch
                    className="w-full"
                  >
                    <Select.Option value="all">Tất cả</Select.Option>
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
                <Input placeholder="Nhập API Key" onChange={(e) => setApiKey(e.target.value)} />
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
              <Button type="dashed">Mua Proxy</Button>
              <Button type="primary" onClick={handleRenewProxy} disabled={isConnected ? true : false}>Kết nối</Button>
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#7cb305',
                  },
                }}
              >
                <Button type="primary" onClick={handleRenewProxy} disabled={isConnected ? false : true}>Đổi IP</Button>
              </ConfigProvider>
              <Button type="primary" danger disabled={isConnected ? false : true}>Hủy kết nối</Button>
            </Col>
          </div>
        </div>
      </ConfigProvider>

      <footer className="bg-gray-100 py-3 flex flex-row justify-between px-3 w-full box-border">
        <div id="autoOption" className="text-gray-500">v1.5</div>
        <div className="text-gray-500">
          2024 © <span id="year" />NetProxy -
          <a
            className="text-blue-500 ml-1 hover:underline"
            id="options-link"
            target="_blank"
            href="https://netproxy.io/"
          >
            Mua Proxy
          </a>
        </div>
        <div></div>
      </footer>
    </>
  )
};

export default Popup;