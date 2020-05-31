import React from "react";
import { Table, Input } from "semantic-ui-react";
import { Decimal } from 'decimal.js';

class GroupRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      company: '',
      price: 0
    };
  }
  

  onChange = (evt, data) => {
    const {index, name, value} = data;
    if (name !== 'price') {
      this.props.onInput(index, name, value);
    } else {
      if (value !== "" && new Decimal(value).gte(0)) {
        this.props.onInput(index, name, parseFloat(new Decimal(value).toFixed(2)));
      } else {
        this.props.onInput(index, name, 0);
      }
    }
  };

  render() {
    const {headers, index, data} = this.props;
    let localStyle = {
      color: 'black'
    }
    if (data.company !== '' && new Decimal(data.price).gt(0)) {
      if (!data.eliminate) {
        if (!data.pValue) {
          localStyle = {
            color: 'red',
            fontWeight: 'bold'
          };
        } else {
          localStyle = {
            color: 'green',
            fontWeight: 'bold'
          };
        }
      } else {
        localStyle = {
          color: 'blue',
          fontWeight: 'bold'
        };
      }
    }

    return (
      <Table.Row style={{...localStyle}} key={`groupRow_${index}`}>
        {
          headers.map((item, i) => {
            if (!!item.isIndex) {
              return (
                <Table.Cell key={`cell_${index}_${i}`} style={{textAlign: 'center'}}>{data[item.name]}</Table.Cell>
              )
            } else if (!!item.editable) {
              return (
                <Table.Cell key={`cell_${index}_${i}`} width={1}>
                  {
                    !!item.isNumber ?
                      <Input index={index} key={`cell_${index}_${i}`} type='number' style={{width: 200}}
                        min='0' max='999999999999.99' step='0.01' name={item.name}
                        onChange={this.onChange} value={data[item.name]}>
                        <input style={{...localStyle}}/>
                      </Input> :
                      <Input index={index} key={`cell_${index}_${i}`} name={item.name} style={{width: 200}}
                        onChange={this.onChange} value={data[item.name]}>
                        <input style={{...localStyle}}/>
                      </Input>
                  }
                </Table.Cell>
              );
            } else {
              return (
                <Table.Cell key={`cell_${index}_${i}`} style={{textAlign: 'center'}}>{data[item.name]}</Table.Cell>
              );
            }
          })
        }
      </Table.Row>
    );
  }
}

export default GroupRow;