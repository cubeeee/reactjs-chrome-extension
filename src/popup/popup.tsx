import React from "react";
import './popup.css'
import { Button, Col, ConfigProvider, Form, Input, InputNumber, Row, Space, Switch, Tag } from "antd";
import { SaveOutlined } from "@ant-design/icons";
const Popup = () => {
    return (
        <>

            <header className="w-[420px] py-3 bg-orange-50">
                <div className="flex flex-col gap-2 items-center">
                    <div className="w-auto h-10">
                        <img alt="Netproxy" className="w-full h-full object-cover" src={'https://console.netproxy.io/logo.svg'} />
                    </div>
                    <div className="text-lg text-center px-2 font-semibold">
                        Proxy dân cư Việt Nam đảm bảo chất lượng{" "}
                    </div>
                </div>
            </header>
            <ConfigProvider
                theme={{
                    token: {
                    },
                }}
            >
                <div className="flex-1 w-full p-4">
                    <Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
                        <Col span={6}>
                            <span>Trạng thái:</span>
                        </Col>
                        <Col span={18}>
                            <Tag color="green">Chưa kết nôi</Tag>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} className="flex flex-row items-center mb-4">
                        <Col span={6}>
                            <span>Tự đông kết đổi IP:</span>
                        </Col>
                        <Col span={4}>
                            <Switch />
                        </Col>
                        <Col span={14} className="flex justify-end items-center gap-2">
                            <Button type="default" icon={<SaveOutlined />}/>
                            <InputNumber min={1} defaultValue={3} />
                            <span>giây</span>
                        </Col>
                    </Row>
                    {/* input api key */}

                    <Button htmlType="submit" type="primary">Save</Button>
                </div>
            </ConfigProvider>

            <footer className="bg-gray-100 py-3 flex flex-row justify-between w-full px-3">
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