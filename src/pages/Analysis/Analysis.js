import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic } from "antd";
import { Pie, Column } from "@ant-design/plots";
import { getEmployees } from "../../services/employeeService";
import { getPhysicalAssets } from "../../services/physicalAssetService";
import { getSoftwareAssets } from "../../services/softwareAssetService";

const Analysis = () => {
    const [employees, setEmployees] = useState([]);
    const [assets, setAssets] = useState([]);
    const [software, setSoftware] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalSalary, setTotalSalary] = useState(0);
    const [totalSoftwareExpense, setTotalSoftwareExpense] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const empResponse = await getEmployees();
            const empData = Array.isArray(empResponse?.data) ? empResponse.data :
                Array.isArray(empResponse) ? empResponse : [];

            const assetData = await getPhysicalAssets();
            const softwareData = await getSoftwareAssets();

            setEmployees(empData);
            setAssets(Array.isArray(assetData) ? assetData : []);
            setSoftware(Array.isArray(softwareData) ? softwareData : []);

            // Calculate total salary and total software expense
            const totalSalaryCalc = empData.reduce((acc, emp) => acc + (emp.salary || 0), 0);
            const totalSoftwareExpenseCalc = softwareData.reduce((acc, s) => acc + (s.subscriptionCost || 0), 0);

            setTotalSalary(totalSalaryCalc);
            setTotalSoftwareExpense(totalSoftwareExpenseCalc);
        } catch (error) {
            console.error("Error fetching data:", error);
            setEmployees([]);
            setAssets([]);
            setSoftware([]);
            setTotalSalary(0);
            setTotalSoftwareExpense(0);
        } finally {
            setLoading(false);
        }
    };

    // Employee distribution by department
    const employeeDepartmentData = employees.reduce((acc, emp) => {
        const department = (emp.dept && emp.dept.trim()) || "Unknown";
        acc[department] = (acc[department] || 0) + 1;
        return acc;
    }, {});

    const formattedEmployeeDepartmentData = Object.entries(employeeDepartmentData).map(([type, value]) => ({
        type,
        value: Number(value),
    }));

    const assetTypeData = Object.values(assets.reduce((acc, asset) => {
        const assetType = (asset.type && asset.type.trim()) || "Unknown";
        acc[assetType] = acc[assetType] || { type: assetType, value: 0 };
        acc[assetType].value += Number(asset.quantity);
        return acc;
    }, {})).map(item => item);

    // Software subscription costs
    const softwareCostData = software.map((s) => ({
        type: s.softwareName,
        value: s.subscriptionCost,
    }));

    // Employee salary distribution
    const salaryData = employees.map((emp) => ({
        type: emp.employeeName || "Unknown",
        value: emp.salary || 0,
    }));

    const pieConfig = {
        appendPadding: 10,
        angleField: 'value',
        colorField: 'type',
        radius: 0.9,
        label: {
            offset: '-30%',
            content: ({ percent, type, value }) => {
                // console.log(`Type: ${type}, Value: ${value}, Percent: ${percent}`); // Debugging
                return `${(percent * 100).toFixed(0)}%`;
            },
            style: {
                fontSize: 14,
                textAlign: 'center',
            },
        },
        interactions: [{ type: 'element-active' }],
    };


    return (
        <div  className="analysis-container" style={{ padding: "20px" }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Card loading={loading}>
                        <Statistic title="Total Employees" value={employees.length} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card loading={loading}>
                        <Statistic title="Total Assets" value={assets.length} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card loading={loading}>
                        <Statistic title="Total Software Licenses" value={software.length} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "20px" }}>
                <Col span={12}>
                    <Card loading={loading}>
                        <Statistic title="Total Software Expense (per year)" value={totalSoftwareExpense} prefix="₹" />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card loading={loading}>
                        <Statistic title="Total Emplpoyee Salary Expense (per year)" value={totalSalary} prefix="₹" />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "20px" }}>
                <Col span={12}>
                    <Card title="Software Subscription Costs" loading={loading}>
                        <Column data={softwareCostData} xField="type" yField="value" colorField="type" />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Employee Salary Distribution" loading={loading}>
                        <Column data={salaryData} xField="type" yField="value" colorField="type" />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: "20px" }}>
                <Col span={12}>
                    <Card title="Employee Distribution by Department" loading={loading}>
                        {!loading && formattedEmployeeDepartmentData.length > 0 && formattedEmployeeDepartmentData.some(item => item.value > 0) && (
                            <Pie {...pieConfig} data={formattedEmployeeDepartmentData} />
                        )}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Asset Distribution by Type" loading={loading}>
                        {!loading && assetTypeData.length > 0 && assetTypeData.some(item => item.value > 0) && (
                            <Pie {...pieConfig} data={assetTypeData} />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Analysis;