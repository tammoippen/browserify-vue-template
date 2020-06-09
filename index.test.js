const expect = require('expect');
const path = require('path');
const transformTools = require('browserify-transform-tools');

const myTransform = require('./index');

var dummyJsFile = path.resolve(__dirname, 'dummy.js');

describe('some positive examples', () => {
  it('unrelated code', done => {
    expect.assertions(1);
    let content = 'console.log("hello world");';
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        if (err) done(err);
        try {
          expect(transformed).toStrictEqual(content);
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });

  it('simple string template', done => {
    expect.assertions(1);
    let content = `const compile_this_template = '<h1>{{ mgs }}</h1>';
    const comp = {
        compile_this_template,
    };`;
    let expected_content = `const compile_this_template = '<h1>{{ mgs }}</h1>';
    const comp = {
        render: function() {with(this){return _c('h1',[_v(_s(mgs))])}}, staticRenderFns: [],
    };`;
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        if (err) done(err);
        try {
          expect(transformed).toStrictEqual(expected_content);
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });

  it('simple template template', done => {
    expect.assertions(1);
    let content = `const compile_this_template = \`<h1>{{ mgs }}</h1>\`;
    const comp = {
        compile_this_template,
    };`;
    let expected_content = `const compile_this_template = \`<h1>{{ mgs }}</h1>\`;
    const comp = {
        render: function() {with(this){return _c('h1',[_v(_s(mgs))])}}, staticRenderFns: [],
    };`;
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        try {
          expect(transformed).toStrictEqual(expected_content);
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });

  it('works with key: value property', done => {
    expect.assertions(1);
    let content = `const compile_this_template = '<h1>{{ mgs }}</h1>';
    const comp = {
        compile_this_template: compile_this_template,
    };`;
    let expected_content = `const compile_this_template = '<h1>{{ mgs }}</h1>';
    const comp = {
        render: function() {with(this){return _c('h1',[_v(_s(mgs))])}}, staticRenderFns: [],
    };`;
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        if (err) done(err);
        try {
          expect(transformed).toStrictEqual(expected_content);
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });

  it('different prop_name', done => {
    expect.assertions(1);
    let content = `const my_prop_name = \`<h1>{{ mgs }}</h1>\`;
    const comp = {
        my_prop_name,
    };`;
    let expected_content = `const my_prop_name = \`<h1>{{ mgs }}</h1>\`;
    const comp = {
        render: function() {with(this){return _c('h1',[_v(_s(mgs))])}}, staticRenderFns: [],
    };`;
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content, config: { prop_name: 'my_prop_name' } },
      function (err, transformed) {
        try {
          expect(transformed).toStrictEqual(expected_content);
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });

  it('works with static functions', done => {
    expect.assertions(1);
    let content = `const compile_this_template = /*html*/ \`
    <div>
        <div>
            <p>This will be static</p>
        </div>
        <h1>{{ msg }}</h1>
        <div>
            <p>This will be static</p>
        </div>
    </div>
    \`;
    const comp = {
        name: "foo-bar",
        compile_this_template,
    };`;
    let expected_content = `const compile_this_template = /*html*/ \`
    <div>
        <div>
            <p>This will be static</p>
        </div>
        <h1>{{ msg }}</h1>
        <div>
            <p>This will be static</p>
        </div>
    </div>
    \`;
    const comp = {
        name: "foo-bar",
        render: function() {with(this){return _c('div',[_m(0),_v(" "),_c('h1',[_v(_s(msg))]),_v(" "),_m(1)])}}, staticRenderFns: [function() {with(this){return _c('div',[_c('p',[_v("This will be static")])])}},function() {with(this){return _c('div',[_c('p',[_v("This will be static")])])}}],
    };`;
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        try {
          expect(transformed).toStrictEqual(expected_content);
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });
});

describe('some errors', () => {
  it('template with expressions', done => {
    expect.assertions(2);
    let content = 'const compile_this_template = `<h1>{{ mgs }}</h1> ${13}`;';
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        try {
          expect(transformed).toBeUndefined();
          expect(err.message).toMatch(
            /No expressions allowed in template string\..*/
          );
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });

  it('template not a string / template', done => {
    expect.assertions(2);
    let content = "const compile_this_template = `<h1>{{ mgs }}</h1>` + '15';";
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        try {
          expect(transformed).toBeUndefined();
          expect(err.message).toMatch(
            /Only string literal or template literal allowed\..*/
          );
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });

  it('template compile error', done => {
    expect.assertions(2);
    let content = 'const compile_this_template = `<h1>{{ mgs }}`;';
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        try {
          expect(transformed).toBeUndefined();
          expect(err.message).toMatch(
            /Template compile errors:\n {2}- tag <h1> has no matching end tag\..*/
          );
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });

  it('no template compiled', done => {
    expect.assertions(2);
    let content = `const comp = {compile_this_template};`;
    transformTools.runTransform(
      myTransform,
      dummyJsFile,
      { content: content },
      function (err, transformed) {
        try {
          expect(transformed).toBeUndefined();
          expect(err.message).toMatch(/No template compiled\..*/);
          done();
        } catch (error) {
          done(error);
        }
      }
    );
  });
});
