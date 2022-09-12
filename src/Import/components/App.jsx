import React, { useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { Col, Row } from "reactstrap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { config } from "../../Config/appConfig";


function App() {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date());
  // process CSV data
  const processData = (dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
      );
      if (headers && row.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];

          if (d.length > 0) {
            if (d[0] === '"') d = d.substring(1, d.length - 1);
            if (d[d.length - 1] === '"') d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter((x) => x).length > 0) {
          obj["Đi muộn"] = +obj["Đi muộn"];
          obj["Về sớm"] = +obj["Về sớm"];
          obj["Về muộn"] = +obj["Về muộn"];

          list.push(obj);
        }
      }
    }

    // prepare columns list from headers
    const columns = headers.map((c) => ({
      name: c,
      selector: c,
    }));

    console.log(list);
    setData(list);
    setColumns(columns);
  };

  // handle change date
  const handleChangeDate = (e) => {
    setDate(e)
  };

  // handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      processData(bstr);
    };
    reader.readAsText(file);
  };

  const validate = () => {
    if(data.length === 0) return 'Dữ liệu trống, vui lòng nhập dữ liệu';
    const checkId = data.every((index) => index['Mã'] === undefined);
    if(checkId) return 'Mã nhân viên không đúng định dạng';
    const checkName = data.every(index => index['Họ tên'] === undefined);
    if(checkName) return 'Tên nhân viên không đúng định dạng';
    return '';
  }

  const uploadOnclick = (e) => {
    console.log("uploadOnclick", data.length);

    console.log(data);

    const checkValid = validate();
    if(checkValid) {
      window.alert(checkValid);
      return;
    }
    axios
      .post(config.base_url + config.api_hr_upload, {
        Date: date.toISOString().slice(0, 10),
        CSVdata: data,
      })
      .then((res) => {
        window.alert('Lưu dữ liệu thành công');
        console.log("Response", res.data);
      })
      .catch((error) => console.log(error));
  };

  return (
    <Col md={12} lg={12} xl={12}>
      <Row>
        <div>
          <h3>
            Import HR CSV file - <span>Rocket Studio</span>
          </h3>

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />

          <input
            type="button"
            value="Save to Database"
            onClick={uploadOnclick}
          />
        </div>
      </Row>
      <Row>
        <ReactDatePicker
          selected={date}
          defaultValues={date}
          onChange={handleChangeDate}
        />
      </Row>
      <Row>
        {" "}
        <DataTable
          pagination
          paginationPerPage={50}
          paginationRowsPerPageOptions={[50, 100, 150, 200]}
          highlightOnHover
          columns={columns}
          data={data}
        />
      </Row>
    </Col>
  );
}

export default App;
