$(document).ready(function(){
	init(); // initialization
	/* Event Handler */
	$("#matrix-operation").change(function(){
		var selected_operation = $("#matrix-operation").val();
		switch(selected_operation){
			case "+":
			case "-":
			case "*":
				$("#m_b").show();
				$("#scalar").hide();
				$(".m_letter").text("A");
				break;
			case "v":
				$("#m_b").hide();
				$("#scalar").show();
				$(".m_letter").text("");
				break;
			case "t":
				$("#m_b").hide();	
				$("#scalar").hide();
				$(".m_letter").text("");
				break;
		}
	});

	$("#calculate").click(function(){
		$("#solution").fadeOut();
		var matrix_a = matrix_get("m_a");
		var matrix_b = matrix_get("m_b");
		var matrix_scalar = $("#matrix-scalar").val();
		var matrix_op = $("#matrix-operation").val();
		var matrix_answer = matrix_solve(matrix_a, matrix_b, matrix_scalar, matrix_op);
		solution(matrix_a, matrix_b, matrix_scalar, matrix_op, matrix_answer);
  		$("#solution").fadeIn();
	});

	$("#m_a_row, #m_a_col").change(function(){
		matrix_row_col_changed($("#m_a_row option:selected").val(), $("#m_a_col option:selected").val(), "matrix_a");
	});
	$("#m_b_row, #m_b_col").change(function(){
		matrix_row_col_changed($("#m_b_row option:selected").val(), $("#m_b_col option:selected").val(), "matrix_b");
	});
	
	$("#random-m_a").click(function(){
		random("matrix_a");
	});
	$("#random-m_b").click(function(){
		random("matrix_b");
	});


	/* Script Functions */
	function init(){
		matrix_row_col_changed($("#m_a_row option:selected").val(), $("#m_a_col option:selected").val(), "matrix_a");
		matrix_row_col_changed($("#m_b_row option:selected").val(), $("#m_b_col option:selected").val(), "matrix_b");
	}

	function random(matrix_id){
	
		$("#"+matrix_id+" > tbody input[type=text]").each(function(){
   			$(this).val(Math.floor(Math.random() * (30 - (-10) + 1)) + (-10));
  		});
	}
	
	function matrix_row_col_changed(row, col, matrix_id){
		$("#"+matrix_id+" > tbody").html("");
		for(var y = 1; y <= row; y++ ){
			$("#"+matrix_id+" > tbody").append("<tr></tr>");
			for(var x = 1; x <= col; x++){
				$("#"+matrix_id+" > tbody > tr:last").append("<td><input type=\"text\" name=\"matrix["+y+"]["+x+"]\" class=\"text-center form-control form-control-sm border border-dark\"></td>");
			}
		}
	}

	function matrix_get(matrix_id){
		var row = $("#"+matrix_id+"_row").val();
		var col = $("#"+matrix_id+"_col").val();
		var arr = [];
		for(var y = 1; y<= row; y++){
			var holder = [];
			for(var x = 1; x<=col; x++){
				var val = $('#'+matrix_id+' input[name="matrix['+y+']['+x+']"]').val().trim();
				(val != "") ? holder.push(val) : holder.push("0");
			}
			arr.push(holder);
		}
		return arr;
	}

	function mlatex_converter(matrix){
		var jax = "\\begin{bmatrix}";
		for(var row = 0; row < matrix.length; row++){
			for(var col = 0; col < matrix[0].length; col++){
				jax += matrix[row][col];
				if(matrix[0].length-1 > col){
					jax += " & ";
				}	
			}
			jax += "\\\\";
		}
		jax += "\\end{bmatrix}";
		return jax;
	}

	function latex_equation(latex){
		var solution = "\\begin{equation*}";
		solution += latex;
		solution += "\\end{equation*}"
		return solution;
	}

	function matrix_solve(matrix_a, matrix_b, scalar, matrix_op){
		switch(matrix_op){
			case "+":
				if(isdimension_same(matrix_a, matrix_b, "")){
					return matrix_add_sub_solver(matrix_a, matrix_b, "+");
				}
				break;
			case "-":
				if(isdimension_same(matrix_a, matrix_b, "")){
					return matrix_add_sub_solver(matrix_a, matrix_b, "-");
				}
				break;
			case "*":
				if(isdimension_same(matrix_a, matrix_b, "", 2)){
					return matrix_mutiplication_solver(matrix_a, matrix_b);
				}
				break;
			case "v":
				if(isdimension_same(matrix_a, matrix_b, scalar, 3)){
					return matrix_scalar_solver(matrix_a, scalar);
				}
				break;
			case "t":
				return matrix_transpose_solver(matrix_a);
				break;
		}
	}

	function isdimension_same(matrix_a, matrix_b, scalar, set = 1){
		if((matrix_a.length == matrix_b.length) && (matrix_a[0].length == matrix_b[0].length) && (set == 1))
			return true;
		else if((matrix_a[0].length == matrix_b.length) && (set == 2))
			return true;
		else if((scalar.trim().length !== 0) && (set == 3))
			return true;
		else{
			Swal.fire({
		title: 'The Matrix dimension is invalid for this operation!',
		text: "Please recheck your inputs",
		icon: 'warning',
		showCancelButton: false,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Okay, Master!'
			});
		
		}
	}

	function matrix_scalar_solver(matrix_a, scalar){
		var arr = [];
		var sol = [];
		for(var row = 0; row < matrix_a.length; row++){
			var holder = [];
			var sol_holder = [];
			for(var col = 0; col < matrix_a[0].length; col++){
				holder.push(nerdamer.expand("("+ matrix_a[row][col]+")*("+scalar+")").evaluate().text('fraction'));
				sol_holder.push("("+ matrix_a[row][col]+") \\cdot ("+scalar+")");
			}
			arr.push(holder);
			sol.push(sol_holder);
		}
		return [arr, sol];
	}

	function matrix_transpose_solver(matrix_a){
		var arr = [];
		for(var col = 0; col < matrix_a[0].length; col++){
			var holder = [];
			for(var row = 0; row < matrix_a.length; row++){
				holder.push(matrix_a[row][col]);
			}
			arr.push(holder);
		}
		return [arr, arr];
	}

	function matrix_mutiplication_solver(matrix_a, matrix_b){
		var arr = [];
		var sol = [];
		for(var row = 0; row < matrix_a.length; row++){
			var row_arr = [];
			var sol_holder = [];
			for(var col = 0; col < matrix_b[0].length; col++){
				var element = "";
				for(var x = 0; x < matrix_b.length; x++){
					element += "("+matrix_a[row][x] +"*"+ matrix_b[x][col]+")";
					if((matrix_b.length - 1) > x ){
						element += "+";
					}
				}
				row_arr.push(nerdamer.expand(element).evaluate().text('fraction'));
				element = element.replace(/\*/g, " \\cdot ");
				sol_holder.push(element);
			}
			arr.push(row_arr);
			sol.push(sol_holder)
		}
		return [arr, sol];
	}

	function matrix_add_sub_solver(matrix_a, matrix_b, operation){
		var arr = [];
		var sol = [];
		for(var y = 0; y < matrix_a.length; y++){
			var arr_holder = [];
			var sol_holder = [];
			for(var x = 0; x < matrix_a[0].length; x++){
				arr_holder.push(nerdamer.expand(matrix_a[y][x]+operation+matrix_b[y][x]).evaluate().text('fraction'));
				sol_holder.push("("+matrix_a[y][x]+operation+"("+matrix_b[y][x]+"))");
			}
			arr.push(arr_holder);
			sol.push(sol_holder);
		}
		return [arr, sol];
	}

	function solution(matrix_a, matrix_b, scalar, operation, sol=[]){
		var equation = "";
		var solution = "";
		var answer = "";
		var step_text = "";
		switch(operation){
			case "-":
			case "+":
				equation = "A"+operation+"B = "+mlatex_converter(matrix_a)+operation+mlatex_converter(matrix_b);
				solution = " = "+mlatex_converter(sol[1])+" = "+mlatex_converter(sol[0]);
				answer = "A"+operation+"B = "+mlatex_converter(sol[0]);
				step_text = ((operation == "+") ? "Add" : "Subtract") +" the elements in the matching positions and simplify each element";
				break;
			case "*":
				equation = "A \\cdot B = "+mlatex_converter(matrix_a)+mlatex_converter(matrix_b);
				solution = " = "+mlatex_converter(sol[1])+" = "+mlatex_converter(sol[0]);
				answer = "A \\cdot B = "+mlatex_converter(sol[0]);
				step_text = "Multiply the rows of the first matrix by the columns of the second matrix and simplify each element";
				break;
			case "v":
				equation = scalar+"\\cdot A = "+scalar+mlatex_converter(matrix_a);
				solution = " = "+mlatex_converter(sol[1])+" = "+mlatex_converter(sol[0]);
				answer = scalar+" \\cdot A = "+mlatex_converter(sol[0]);
				step_text = "Scalar multiplication: Multiply each of the matrix elements by a scalar";
				break;
			case "t":
				equation = "A^t = "+mlatex_converter(matrix_a)+"^t";
				solution = " = "+mlatex_converter(matrix_a)+"^t = "+mlatex_converter(sol[0]);
				answer = "A^t = "+mlatex_converter(sol[0]);
				step_text = "Transpose matrix by turning rows into columns";
				break;
		}
		$("#solution-equation").text(latex_equation(equation));
		$("#solution-flow").text(latex_equation(solution.replace(/\*/g, " \\cdot ")));
		$("#solution-answer").text(latex_equation(answer.replace(/\*/g, " \\cdot ")));
		$("#solution-step").html("<p>"+step_text+"</p>");
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, "solution"]);
	}
});