/*eslint-disable*/
import React,{ Component, Fragment } from 'react';
import BackTop from './backTop.js';
import styles from './style.less';

const timeout = delay => new Promise(resolve => setTimeout(resolve,delay));

class Scroll extends Component {

  static defaultProps ={
    noMore: false,
    pullDownRefresh: null,
    pullUpLoad: null,
    backTop: false,
    noMoreTip: '我是有底线的'
  };

  state = {
    translateY: 0,
    move:false,
    pullUpHide: true,
    pullDownStatus: 0,  // 0:未开始  1: 刷新中  2: 刷新成功  3:刷新失败
    pullUpStatus: 0,   // 0:未开始 1:加载中 2:加载完成 3:加载失败
    backTopVisible: false,
  };

  scrollTop = 0;
  touchX = 0;
  touchY = 0;
  time = 0;
  type = '';
  pullDownDoneBacking = false; //下拉刷新完成后，正在回弹至初始位置的状态。 ps:解决一直重复下拉时的bug

  componentDidMount(){
    //内容高度小于滚动区域高度时隐藏底部的提示信息（判定为数据少不需要显示底部信息）
    this.setState({
      pullUpHide: this.innerEl.clientHeight < this.wrapperEl.clientHeight
    });
    //解决ios和安卓的页面自带滚动回弹
    this.wrapperEl.addEventListener('touchmove', this.touchMoveHandle, {passive: false})
  }

  componentDidUpdate(prevProps){
    //内容发生变化时重新计算 pullUpHide
    if(prevProps.children !== this.props.children){
      const pullUpHide = this.innerEl.clientHeight < this.wrapperEl.clientHeight;
      this.setState({
        pullUpHide
      })
    }
  }

  scrollHandle = (e)=>{
    const { pullUpStatus, pullUpHide } = this.state;
    const { pullUpLoad, noMore, backTop } = this.props;
    //获取滚动距离，滚动方向，距底部距离
    const direction = e.target.scrollTop > this.scrollTop ? 'up' : 'down';
    this.scrollTop = e.target.scrollTop;
    const scrollBottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    /*
      * 距底部距离小于10且是向上滚动
      * 开启了上拉加载 且 未隐藏底部提示 且 还有更多数据 且 不是正在加载中
      * 触发上拉加载
      * */
    if(scrollBottom < 10 && direction === 'up'){
      if(pullUpLoad && !pullUpHide &&  !noMore && pullUpStatus !== 1){
        this.pullUpLoad();
      }
    }

    //backTop
    if(!backTop) return;
    //滚动距离大于页面高度时显示 backTop组件反正隐藏
    if(this.wrapperEl.scrollTop > this.wrapperEl.clientHeight && !this.state.backTopVisible){
      this.setState({backTopVisible: true});
      this.state.backTopVisible=  true;
    }else if(this.wrapperEl.scrollTop <= this.wrapperEl.clientHeight && this.state.backTopVisible){
      this.setState({backTopVisible: false});
      this.state.backTopVisible=  false;
    }
  };

  touchStartHandle = (e)=>{
    if(e.touches.length > 1) return;
    const touch = e.touches[0];
    //在页面顶部和底部时才 开启拉动动效
    if(this.wrapperEl.scrollTop <= 0 || (this.wrapperEl.scrollHeight === this.wrapperEl.scrollTop + this.wrapperEl.clientHeight)){
      this.state.move = true;
      this.setState({move: true});
      this.touchX = touch.clientX;
      this.touchY = touch.clientY;
      this.time = new Date().getTime();
      if(this.wrapperEl.scrollTop <= 0){ //顶部拉动时，判定为下拉刷新模式
        this.type = 'pullDown'
      }else{ //底部拉动时,判定为上拉加载模式
        this.type = 'pullUp'
      }
    }else{
      //关闭拉动动效
      this.state.move = false;
      this.setState({move: false})
    }
  };

  touchMoveHandle = (e)=>{
    if(e.touches.length > 1 || !this.state.move) return;
    const { pullDownRefresh, pullUpLoad } = this.props;
    //获取拉动偏移量
    const touch = e.touches[0];
    const moveX = touch.clientX - this.touchX;
    const moveY = touch.clientY - this.touchY;

    // 下拉刷新模式下，Y轴偏移量为负（上拉）,或未开启下拉刷新时，返回
    if(this.type === 'pullDown' && (moveY  < 0 || !pullDownRefresh) ) return;
    //上拉加载模式下，Y轴偏移量为正（下拉），或未开启上拉加载时，返回
    if(this.type === 'pullUp' && (moveY  > 0 || !pullUpLoad || this.state.pullUpHide) ) return;

    /*
    * 在20毫秒内 X轴偏移量/Y轴偏移量 > 0.8 ,则判定用户在进行横向滑动，而不是纵向滑动
    * 此时拉动动效，初始化各变量
    * */
    if(new Date().getTime() - this.time < 20){
      if(Math.abs(moveX/moveY) > .8){
        this.touchX = 0;
        this.touchY = 0;
        this.time = 0;
        this.state.move = false;
        this.setState({move: false})
      }
    }else{
      /*
      * 否则判定为进行纵向滑动，
      * 页面跟随滑动距离为手指移动距离的 0.3 倍
      * */
      this.setState({
        translateY: moveY * .3
      });
    }
    e.preventDefault();
  };

  touchEndHandle = (e)=>{
    if(!this.state.move) return;
    const touch = e.changedTouches[0];
    const moveY = touch.clientY - this.touchY;
    //手指抬起时Y轴偏移量为0则不判定为在进行滑动，返回
    if(moveY === 0) return;
    //重置各变量
    this.touchX = 0;
    this.touchY = 0;
    this.time = 0;
    this.state.move = false;

    const { translateY, pullUpHide, pullDownStatus, pullUpStatus } = this.state;
    const { pullDownRefresh, pullUpLoad, noMore } = this.props;

    if(this.type === 'pullDown'){
      /*
      * 手抬起时下拉刷新不是未开始状态下时
      * 拉动量赋值回40或0并返回
      * */
      if(pullDownStatus !== 0) {
        this.setState({
          translateY: this.pullDownDoneBacking ? 0 : 40
        });
        return
      }
      //未开启下拉刷新 或者 拉动量小于 40 （达不到下拉刷新要求拉动量）时，回弹。
      if(!pullDownRefresh || translateY <= 40){
        this.setState({
          move: false,
          translateY: 0
        })
      }else{
        //否则判定为成功触发下拉刷新
        this.pullDownRefresh();
      }
    }else if(this.type === 'pullUp'){
      //回弹
      this.setState({
        move: false,
        translateY: 0
      });
      /*
      * 开启了上拉加载 且 未隐藏底部提示 且 还有更多数据 且 不是正在加载中 且 Y轴偏移量小于0（是在上拉）
      * 触发上拉加载
      * */
      if(pullUpLoad && !pullUpHide && !noMore && pullUpStatus !== 1 && moveY < 0){
        this.pullUpLoad();
      }
    }
    this.type = '';
  };

  /*
  * 可在父组件中通过ref调用该方法，传入自定义异步函数组件会根据异步函数的状态去处理下拉的状态，自动下拉刷新
  * */
  //下拉刷新
  pullDownRefresh = async (customAsyncFn)=>{
    const { pullDownRefresh } = this.props;
    if(!customAsyncFn){
      if(!pullDownRefresh)return;
      customAsyncFn = pullDownRefresh;
    }else {
      //主动触发时至少加载300ms
      const fn = customAsyncFn;
      customAsyncFn = ()=>Promise.all([fn(),timeout(300)])
    }
    this.setState({
      move: false,
      translateY: 40,
      pullDownStatus: 1
    });
    try{
      await customAsyncFn();
      this.setState({
        pullDownStatus: 2
      });
    }catch (e) {
      this.setState({
        pullDownStatus: 3
      });
    }
    await timeout(500);
    this.setState({
      translateY:0,
    });
    this.pullDownDoneBacking = true;
    await timeout(300);
    this.setState({
      pullDownStatus: 0
    });
    this.state.pullDownStatus = 0;
    this.pullDownDoneBacking = false;
  };

  //上拉加载
  pullUpLoad = async ()=>{
    const { pullUpLoad } = this.props;
    this.setState({
      pullUpStatus: 1
    });
    this.state.pullUpStatus = 1;
    try{
      await pullUpLoad();
      this.setState({
        pullUpStatus : 2
      });
    }catch (e){
      this.setState({
        pullUpStatus : 3
      })
    }
  };

  //返回顶部
  backTop = ()=>{
    const H = this.wrapperEl.scrollTop;
    //300ms内处理完动画，间隔20ms
    const speed = H / (300 /20);
    const timer = setInterval(()=>{
      if(this.wrapperEl.scrollTop >= speed){
        this.wrapperEl.scrollTop -= speed;
      }else{
        this.wrapperEl.scrollTop = 0;
        clearInterval(timer);
      }
    },20);
  };

  render(){
    const { translateY, move, pullUpHide, pullDownStatus, pullUpStatus, backTopVisible } = this.state;
    const { pullDownRefresh, pullUpLoad, children, noMore, backTop, noMoreTip } = this.props;

    return(
      <Fragment>
        <div className={styles.wrapper}
             ref={ el=> this.wrapperEl = el}
             onScroll={this.scrollHandle}
             onTouchStart={this.touchStartHandle}
             onTouchEnd={this.touchEndHandle}
        >
          <div
            style={{
              transform: `translateY(${translateY}px)`,
              transition: move ? '' : 'transform .3s ease'
            }}
          >
            {
              pullDownRefresh &&
              <div className={styles.pullDownTip}>
                {
                  pullDownStatus !== 0 ?
                    <div>
                      { pullDownStatus === 1 && <img className={styles.loading} src={require('./imgs/loading.png')}/> }
                      { pullDownStatus === 2 && <img src={require('./imgs/success.png')}/> }
                      { pullDownStatus === 3 && <img src={require('./imgs/fail.png')}/> }
                      <span>
                      { pullDownStatus === 1 && '正在刷新' }
                        { pullDownStatus === 2 && '刷新成功' }
                        { pullDownStatus === 3 && '刷新失败' }
                    </span>
                    </div> :
                    <div>
                      <img src={require('./imgs/pull.png')}
                           style={{
                             transform: `rotate(${ translateY > 60 ? 180 : 0 }deg)`
                           }}
                      />
                      <span>{ translateY > 60 ? '释放' : '下拉' }刷新</span>
                    </div>
                }
              </div>
            }
            <div ref={el=>this.innerEl = el}>{ children }</div>
            {
              !pullUpHide && pullUpLoad &&
              <div className={styles.pullUpTip}>
                {
                  noMore ? noMoreTip :
                    pullUpStatus === 0 || pullUpStatus === 1 ?
                      <div>
                        <img className={styles.loading} src={require('./imgs/loading.png')}/>
                        <span>加载中</span>
                      </div> :
                      pullUpStatus === 2 ?
                        <div>
                          <img src={require('./imgs/success.png')}/>
                          <span>加载成功</span>
                        </div> :
                        pullUpStatus === 3 ?
                          <div>
                            <img src={require('./imgs/fail.png')}/>
                            <span>加载失败</span>
                          </div> : ''
                }
              </div>
            }
          </div>
        </div>
        <BackTop icon={ typeof backTop !== 'boolean' ? backTop : false} visible={backTopVisible} onBack={this.backTop}/>
      </Fragment>
    )
  }
}

export default Scroll
