package main

import (
	"syscall/js"
)

func main() {
	c := make(chan struct{}, 0)
	js.Global().Set("add", js.FuncOf(add))
	js.Global().Set("sub", js.FuncOf(sub))
	js.Global().Set("testGo", js.FuncOf(testGo))
	<-c
}

func testGo(this js.Value, p []js.Value) interface{} {
	n := p[0].Int()
	if n <= 0 {
		return js.ValueOf(0)
	}
	a, b := 0, 1
	for i := 2; i <= n; i++ {
		a, b = b, a+b
	}
	return js.ValueOf(b)
}

// add 函数接受两个参数并返回它们的和
func add(this js.Value, args []js.Value) interface{} {
	sum := args[0].Int() + args[1].Int()
	return js.ValueOf(sum)
}

// sub 函数接受两个参数并返回它们的差
func sub(this js.Value, args []js.Value) interface{} {
	difference := args[0].Int() - args[1].Int()
	return js.ValueOf(difference)
}
