/*
* @Author: 94468
* @Date:   2018-03-16 18:24:47
* @Last Modified by:   Jeffrey Wang
* @Last Modified time: 2018-09-19 14:04:28
*/
// �ڵ���
layui.define(['jquery', 'form'], function(exports){
	$ = layui.jquery;
	form = layui.form;

	obj = {
		// ��Ⱦ + ���¼�
		openIconContent: '&#xe625;',
		closeIconContent: '&#xe623;',
		checkedNode : [],
		notCheckedNode : [],
		/**
		 * ��ȾDOM�����¼�
		 * @param  {[type]} dst       [Ŀ��ID���磺#test1]
		 * @param  {[type]} trees     [���ݣ���ʽ��{}]
		 * @param  {[type]} inputname [�ϴ�����]
		 * @param  {[type]} layfilter [lay-filter��ֵ]
		 * @param  {[type]} openall [Ĭ��չ��ȫ��]
		 * @return {[type]}           [description]
		 */
		render: function(dst, trees, opt){
			var inputname = opt.inputname ? opt.inputname : 'menuids[]';
			var layfilter = opt.layfilter ? opt.layfilter : 'checkauth';
			var openall = opt.openall ? opt.openall : false;
			var autowidth = opt.autowidth !== false ? true : false;

			$(dst).html(obj.renderAuth(trees, 0, {inputname: inputname, layfilter: layfilter, openall: openall}));
			form.render();
			// �䶯���һ����ʱ״̬
			obj._saveNodeStatus(dst);

			// ��������Զ�����Ż�
			if (autowidth) {
				$(dst).css({
					'whiteSpace': 'nowrap',
					'maxWidth' : '100%',
				});
				$(dst).find('.layui-form-checkbox').each(function(index, item){
					if ($(this).is(':hidden')) {
						// �Ƚ�����Ļ�ȡ����Ԫ�ؿ�ȵ��ַ��������
						$('body').append('<div id="layui-authtree-get-width">'+$(this).html()+'</div>');
						$width = $('#layui-authtree-get-width').find('span').width() + $('#layui-authtree-get-width').find('i').width() + 25;
						$('#layui-authtree-get-width').remove();
					} else {
						$width = $(this).find('span').width() + $(this).find('i').width() + 25;
					}
					$(this).width($width);
				});
			}
			// ��ע�����ʹ��form.on('checkbox()')���ⲿ���޷�ʹ��form.on()����ͬ����Ԫ���ˣ�LAYUI��֧���ظ������ˣ���
			// form.on('checkbox('+layfilter+')', function(data){
			// 	/*��������Ȩ��״̬���棬���ѡ�У�������ȫ��ѡ��*/
			// 	var childs = $(data.elem).parent().next().find('input[type="checkbox"]').prop('checked', data.elem.checked);
			// 	if(data.elem.checked){
			// 		/*����child��ǰ��һ��Ԫ�أ�������ߵ�checkboxѡ��״̬��Ϊtrue��*/
			// 		$(data.elem).parents('.auth-child').prev().find('input[type="checkbox"]').prop('checked', true);
			// 	}
			// 	/*console.log(childs);*/
			// 	form.render('checkbox');
			// });
			$(dst).find('.auth-single:first').unbind('click').on('click', '.layui-form-checkbox', function(){
				var elem = $(this).prev();
				var checked = elem.is(':checked');

				// �䶯���һ����ʱ״̬
				obj._saveNodeStatus(dst);

				var childs = elem.parent().next().find('input[type="checkbox"]').prop('checked', checked);
				if(checked){
					/*����child��ǰ��һ��Ԫ�أ�������ߵ�checkboxѡ��״̬��Ϊtrue��*/
					elem.parents('.auth-child').prev().find('input[type="checkbox"]').prop('checked', true);
				}
				/*console.log(childs);*/
				form.render('checkbox');
			});

			/*��̬��չ���¼�*/
			$(dst).unbind('click').on('click', '.auth-icon', function(){
				var origin = $(this);
				var child = origin.parent().parent().find('.auth-child:first');
				if(origin.is('.active')){
					/*����*/
					origin.removeClass('active').html(obj.closeIconContent);
					child.slideUp('fast');
				} else {
					/*չ��*/
					origin.addClass('active').html(obj.openIconContent);
					child.slideDown('fast');
				}
				return false;
			})
		},
		// �ݹ鴴����ʽ
		renderAuth: function(tree, dept, opt){
			var inputname = opt.inputname;
			var layfilter = opt.layfilter;
			var openall = opt.openall;
			var str = '<div class="auth-single">';

			layui.each(tree, function(index, item){
				var hasChild = item.list ? 1 : 0;
				// ע�⣺�ݹ����ʱ��this�Ļ�����ı䣡
				var append = hasChild ? obj.renderAuth(item.list, dept+1, opt) : '';

				// '+new Array(dept * 4).join('&nbsp;')+'
				str += '<div><div class="auth-status"> '+
					(hasChild?'<i class="layui-icon auth-icon '+(openall?'active':'')+'" style="cursor:pointer;">'+(openall?obj.openIconContent:obj.closeIconContent)+'</i>':'<i class="layui-icon auth-leaf" style="opacity:0;">&#xe626;</i>')+
					(dept > 0 ? '<span>���� </span>':'')+
					'<input type="checkbox" name="'+inputname+'" title="'+item.name+'" value="'+item.value+'" lay-skin="primary" lay-filter="'+layfilter+'" '+
					(item.checked?'checked="checked"':'')+'> </div>'+
					' <div class="auth-child" style="'+(openall?'':'display:none;')+'padding-left:40px;"> '+append+'</div></div>'
			});
			str += '</div>';
			return str;
		},
		// ��̬��ȡ������
		getMaxDept: function(dst){
			var next = $(dst);
			var dept = 1;
			while(next.length && dept < 100000) {
				next = this._getNext(next);
				if (next.length) {
					dept++;
				} else {
					break;
				}
			}
			return dept;
		},
		// ȫѡ
		checkAll: function(dst){
			var origin = $(dst);
			// ���ƺõ�һ�㼴��
			origin.find('.auth-single:first>div>.auth-status input').each(function(index, item) {
				if ($(this).is(':checked')) {
					// ���������checked״̬�������ײ���״̬��ȡ����Ŀ���BUG
					$(this).prop('checked', true).next().click(function(){$(this).click()});
				} else {
					$(this).next().click();
				}
			});
		},
		// ȫ��ѡ
		uncheckAll: function(dst){
			var origin = $(dst);
			// ���ƺõ�һ�㼴��
			origin.find('.auth-single:first>div>.auth-status input').each(function(index, item) {
				if ($(this).is(':checked')) {
					$(this).prop('checked', true).next().click();
				} else {
					// $(this).parent().click().click();
				}
			});
		},
		// ��ʾ������
		showAll: function(dst) {
			this.showDept(dst, this.getMaxDept(dst));
		},
		// �ر�������
		closeAll: function(dst) {
			this.closeDept(dst, 1);
		},
		// �л�����������ʾ/�ر�
		toggleAll: function(dst) {
			if (this._shownDept(2)) {
				this.closeDept(dst);
			} else {
				this.showAll(dst);
			}
		},
		// ��ʾ���� dept ��
		showDept: function(dst, dept) {
			var next = $(dst);
			for(var i = 1; i < dept; i++) {
				next = this._getNext(next);
				if (next.length) {
					this._showSingle(next);
				} else {
					break;
				}
			}
		},
		// �� dept ��֮��ȫ���ر�
		closeDept: function(dst, dept) {
			var next = $(dst);
			for(var i = 0; i < dept; i++){
				next = this._getNext(next);
			}
			while(next.length) {
				this._closeSingle(next);
				next = this._getNext(next);
			}
		},
		// ��ʱ�������нڵ���Ϣ״̬
		_saveNodeStatus: function(dst){
			this.checkedNode[dst] = this.getChecked(dst);
			this.notCheckedNode[dst] = this.getNotChecked(dst);
		},
		// �ж�ĳһ���Ƿ���ʾ
		_shownDept: function(dst, dept) {
			var next = $(dst);
			for(var i = 0; i < dept; i++){
				next = this._getNext(next);
			}
			return !next.is(':hidden');
		},
		// ��ȡ
		_getNext: function(dst) {
			return $(dst).find('.auth-single:first>div>.auth-child');
		},
		// ��ʾĳ�� single
		_showSingle: function(dst) {
			var origin = $(dst).find('.auth-single:first');
			var parentChild = origin.parent();
			var parentStatus = parentChild.prev();
			if (!parentStatus.find('.auth-icon').hasClass('active')) {
				parentChild.show();
				// ��ʾ�ϼ��� .auth-child�ڵ㣬���޸�.auth-status���۵�״̬
				parentStatus.find('.auth-icon').addClass('active').html(obj.openIconContent);
			}
		},
		// �ر�ĳ�� single
		_closeSingle: function(dst) {
			var origin = $(dst).find('.auth-single:first');
			var parentChild = origin.parent();
			var parentStatus = parentChild.prev();
			if (parentStatus.find('.auth-icon').hasClass('active')) {
				parentChild.hide();
				// ��ʾ�ϼ��� .auth-child�ڵ㣬���޸�.auth-status���۵�״̬
				parentStatus.find('.auth-icon').removeClass('active').html(obj.closeIconContent);
			}
		},
		// ��ȡѡ��Ҷ�ӽ��
		getLeaf: function(dst){
			var leafs = $(dst).find('.auth-leaf').parent().find('input[type="checkbox"]:checked');
			var data = [];
			leafs.each(function(index, item){
				// console.log(item);
				data.push(item.value);
			});
			// console.log(data);
			return data;
		},
		// ��ȡ���нڵ�����
		getAll: function(dst){
			var inputs = $(dst).find('input[type="checkbox"]');
			var data = [];
			inputs.each(function(index, item){
				data.push(item.value);
			});
			// console.log(data);
			return data;
		},
		// ����ѡ�У�֮ǰȡ��-����ѡ�У�
		getLastChecked: function(dst) {
			var lastCheckedNode = this.getChecked(dst);

			var data = [];
			for (i in lastCheckedNode) {
				if ($.inArray(lastCheckedNode[i], this.notCheckedNode[dst]) != -1) {
					data.push(lastCheckedNode[i]);
				}
			}
			return data;
		},
		// ��ȡ����ѡ�е�����
		getChecked: function(dst){
			var inputs = $(dst).find('input[type="checkbox"]:checked');
			var data = [];
			inputs.each(function(index, item){
				data.push(item.value);
			});
			return data;
		},
		// ����ȡ����֮ǰѡ��-����ȡ����
		getLastNotChecked: function(dst) {
			var lastNotCheckedNode = this.getNotChecked(dst);

			var data = [];
			for (i in lastNotCheckedNode) {
				if ($.inArray(lastNotCheckedNode[i], this.checkedNode[dst]) != -1) {
					data.push(lastNotCheckedNode[i]);
				}
			}
			return data;
		},
		// ��ȡδѡ������
		getNotChecked: function(dst){
			var inputs = $(dst).find('input[type="checkbox"]:not(:checked)');
			var data = [];
			inputs.each(function(index, item){
				data.push(item.value);
			});
			// console.log(data);
			return data;
		}
	}
	exports('authtree', obj);
});