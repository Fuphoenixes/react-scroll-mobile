import React, { Component } from 'react';
import './App.css';
import Scroll from 'react-scroll-mobile'

const timeout = delay => new Promise(resolve => setTimeout(resolve,delay));

class App extends Component {

  state = {
    list:[],
    noMore: false
  }

  pageIndex = 1;

  componentDidMount(){
    //首次加载时，可以主动触发下拉加载动效，更炫酷
    this.scrollRef.pullDownRefresh(this.pullDownRefresh)
  }

	pullDownRefresh = async ()=>{
    this.pageIndex = 1;
    await this.getData();
  };

	pullUpLoad = async ()=>{
    this.pageIndex ++;
    await this.getData();
  };

  getData = async ()=>{
    //模拟请求和数据
    await timeout(1000);
    let res = [0,1,2,3,4,5,6,7,8,9];
    if(this.pageIndex > 4 )res = []; // 模拟没有数据了

    const list = this.pageIndex === 1 ? res : this.state.list.concat(res);
    this.setState({ 
      list,
      noMore: res.length === 0 
    })
  }

  render() {
    const { list, noMore } = this.state;

    return (
	    <div className='list'>
		    <Scroll
          ref={el=> this.scrollRef = el}
			    pullDownRefresh={this.pullDownRefresh}
          pullUpLoad={this.pullUpLoad}
          noMore={noMore}
          backTop
		    >
			    <ul>
				    {
              list.map((item,index)=><li key={index}>数据数据数据数据{index}</li>)
            }
			    </ul>
		    </Scroll>
	    </div>
    );
  }
}

export default App;
