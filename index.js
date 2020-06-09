const transformTools = require('browserify-transform-tools');
const compiler = require('vue-template-compiler');

let options = {
  jsFilesOnly: true,
};

let compile_result = {
  render: null,
  staticRenderFns: null,
};

module.exports = transformTools.makeFalafelTransform(
  'browserify-vue-template',
  options,
  function (node, transformOptions, done) {
    let prop_name = 'compile_this_template';
    if (transformOptions.config) {
      prop_name = transformOptions.config.prop_name;
    }
    if (node.type === 'VariableDeclarator' && node.id.name === prop_name) {
      const init_node = node.init;
      let template = null;
      if (init_node.type === 'TemplateLiteral') {
        if (
          init_node.expressions &&
          Array.isArray(init_node.expressions) &&
          init_node.expressions.length > 0
        ) {
          return done(new Error('No expressions allowed in template string.'));
        }
        template = init_node.quasis[0].value.raw;
      } else if (
        init_node.type === 'Literal' &&
        typeof init_node.value === 'string'
      ) {
        template = init_node.value;
      } else {
        return done(
          new Error('Only string literal or template literal allowed.')
        );
      }
      if (template !== null) {
        const result = compiler.compile(template, transformOptions.compiler);
        if (
          result.errors &&
          Array.isArray(result.errors) &&
          result.errors.length > 0
        ) {
          return done(
            new Error(
              `Template compile errors:\n  - ${result.errors.join('\n  - ')}\n`
            )
          );
        }
        compile_result.render = 'function() {' + result.render + '}';
        compile_result.staticRenderFns = result.staticRenderFns.map(
          v => 'function() {' + v + '}'
        );
      }
    }

    if (
      node.type === 'Property' &&
      node.shorthand &&
      node.key.name === prop_name
    ) {
      if (compile_result.render === null) {
        return done(new Error('No template compiled.'));
      }
      node.update(
        `render: ${compile_result.render}, staticRenderFns: [${compile_result.staticRenderFns}]`
      );
      compile_result = {
        render: null,
        staticRenderFns: null,
      };
    }
    done();
  }
);
