# react-scroll-mobile
---

1. react移动端滚动组件,支持上拉加载、下拉刷新、返回顶部。
2. [项目源码](https://github.com/Fuphoenixes/react-scroll-mobile)
3. 觉得好用给个star，谢啦！

## example
  ![erweima](https://fuphoenixes.github.io/example/erweima/react-scroll-mobile.png)
  
## Install

```
npm install react-scroll-mobile
```
或
```
yarn add react-scroll-mobile
```

## Usage

```
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
    // 模拟没有数据了 
    if(this.pageIndex > 4 )res = [];

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

```

## API

### 选项
| 属性 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| pullDownRefresh | Function | null | 下拉刷新时的回调函数,需要返回一个Promise来获取刷新状态,resolve刷新成功，reject刷新失败,建议直接使用async await
| pullUpLoad | Function | null | 上拉加载时的回调函数,需要返回一个Promise来获取加载状态,resolve加载成功，reject加载失败,建议直接使用async await
| noMore | Boolean | false | 上拉加载时，是否还有更多数据
| noMoreTip | String/ReactComponent | '我是有底线的' | 上拉加载时，没有更多数据的提示语
| backTop | Boolean/ReactComponent | false | 右下角返回顶部组件，设置为true时显示自带的组件，设置为ReactComponent是即使用自定义的返回顶部组件替换



