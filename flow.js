var THREAD_PREFIX = '$__thrd__$_';

function default_function_expression() {
	return {
		type: "FunctionExpression",
		id: null,
		params: [],
		defaults: [],
		rest: null,
		generator: false,
		expression: false,
		is_thread: true,
		body: {
			type: "BlockStatement",
			body: []
		}
	};
}

function default_variable_declaration() {
	return {
		type: "VariableDeclaration",
		declarations: [{
			type: "VariableDeclarator",
			id: {
				type: "Identifier",
				name: "DEFAULT"
			},
			init: {
				type: "Identifier",
				name: "arguments"
			}
		}],
		kind: "var"
	};
}

function default_expression_statement() {
	return {
		type: "ExpressionStatement"
	};
}

function get_node_children(node) {
	switch (node.type) {
		case "Program":
			return node.body;
			break;
		case "Function":
			return [node.body];
			break;
		case "BlockStatement":
			return node.body;
			break;
		case "IfStatement":
			return [node.consequent, node.alternate];
			break;
		case "LabeledStatement":
			return [node.body];
			break;
		case "SwitchStatement":
			return [node.cases];
			break;
		case "WhileStatement":
			return [node.body];
			break;
		case "DoWhileStatement":
			return [node.body];
			break;
		case "ForStatement":
			return [node.body];
			break;
		case "ForInStatement":
			return [node.body];
			break;
		case "FunctionDeclaration":
			return [node.body];
			break;
		case "VariableDeclaration":
			return node.declarations;
			break;
		case "VariableDeclarator":
			return [node.init];
			break;
		case "ArrayExpression":
			return node.elements;
			break;
		case "ObjectExpression":
			return node.properties;
			break;
		case "Property":
			return [node.value];
			break;
		case "FunctionExpression":
			return [node.body];
			break;
		case "UnaryExpression":
			return [node.argument];
			break;
		case "BinaryExpression":
			return [node.left, node.right];
			break;
		case "AssignmentExpression":
			return [node.left, node.right];
			break;
		case "LogicalExpression":
			return [node.left, node.right];
			break;
		case "ConditionalExpression":
			return [node.alternate, node.consequent];
			break;
		case "NewExpression":
			return node.arguments;
			break;
		case "CallExpression":
			return node.arguments;
			break;
		case "MemberExpression":
			return [node.property];
			break;
		case "SwitchCase":
			return node.consequent;
			break;
		default:
			return [];
	}
}

function is_thread_node(node) {
	if (node.is_thread !== undefined) return node.is_thread;
	if (node.type !== "FunctionDeclaration") return false;
	if (node.id.name.indexOf(THREAD_PREFIX) === 0) return true;
	return false;
}

function replace_underscore(result_var, thread_statements) {
	var result = default_function_expression();
	var args_assignment = default_variable_declaration();
	args_assignment.declarations[0].id.name = result_var;
	result.body.body = thread_statements;
	result.body.body.unshift(args_assignment);
	return result;
}

function handle_thread_node(node) {
	var blk_statement = node.body;
	var blk_statement_children = get_node_children(blk_statement);
	for (var child_idx = 0; child_idx < blk_statement_children.length; child_idx++) {
		var child = blk_statement_children[child_idx];
		if (child.type === "VariableDeclaration") { //TODO assignment
			for (var i = 0; i < child.declarations.length; i++) {
				var declarator = child.declarations[i];
				var result_var = declarator.id.name;
				if (declarator.init && declarator.init.type === "CallExpression") {
					var underscore_idx = -1;
					for (var i = 0; i < declarator.init.arguments.length; i++) {
						if (declarator.init.arguments[i].name === "_") {
							underscore_idx = i;
							break;
						}
					};

					if (underscore_idx !== -1) {
						var thread_statements = [];
						while (blk_statement.body.length !== child_idx + 1) {
							thread_statements.unshift(blk_statement.body.pop());
						}

						declarator.init.arguments[underscore_idx] = replace_underscore(result_var, thread_statements);
						var call_expression_parent = default_expression_statement();
						call_expression_parent.expression = declarator.init;
						blk_statement.body[child_idx] = call_expression_parent;
						// console.log('recurse', blk_statement.body[child_idx]);
						handle_thread_node(declarator.init.arguments[underscore_idx]);
						return;
					}
				}
			}
		}
	}
}

function recurse_tree(node, parent) {
	if (!node) return;
	if (is_thread_node(node)) handle_thread_node(node);

	var children = get_node_children(node);
	for (var i = 0; i < children.length; i++) {
		recurse_tree(children[i]);
	}
}

exports.recurseTree = recurse_tree;