import React,{ Component } from 'react'
import styles from './style.less'
import classnames from 'classnames'

class ReactComponent extends Component{
  state = {
    move: false
  };

  tap = ()=>{
    this.setState({move:true});
    setTimeout(()=>{
      this.setState({move:false})
    },310);
    this.props.onBack();
  };

  render() {
    const { visible, icon } = this.props;
    return (
      <div className={classnames(styles.back_top,{[styles.move]:this.state.move},{[styles.show]:visible})} onClick={this.tap}>
        { icon || <img src={require('./imgs/backTop.png')} alt=""/>}
      </div>
    );
  }
}

export default ReactComponent
