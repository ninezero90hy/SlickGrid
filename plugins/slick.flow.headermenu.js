(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Plugins": {
        "HeaderMenu": HeaderMenu
      }
    }
  });

  function HeaderMenu(options) {

    let _grid;
    const _self = this;
    const _handler = new Slick.EventHandler();
    const _defaults = {};

    let $activeHeaderColumn;

    //  사용 가능한 아이콘 목록
    //
    //  drop: 'grid-icon-drop-editdel3',
    //  alter: 'grid-icon-drop-change',
    //  edit: 'grid-icon-drop-editmodify',
    //  generate: 'grid-icon-drop-generate',
    //  sort: 'grid-icon-drop-sort',
    //  move: 'grid-icon-drop-move',
    //  clean: 'grid-icon-drop-clean'

    // `메뉴헤더` 플러그인의 레이어 팝업 엘리먼트
    // 해당 플러그인 레이어의 최상위 엘리먼트 입니다
    //
    // e.g ) html 샘플
    // <div class="ddp-wrap-popup2 ddp-types ddp-type-rulepop">
    //     <ul class="ddp-list-popup">
    //         <li>
    //             <a href="javascript:">
    //                 <em class="ddp-icon-drop-editdel3"></em>
    //                 Drop
    //             </a>
    //         </li>
    //         <li>
    //             <a href="javascript:">
    //                 <em class="ddp-icon-drop-change"></em>
    //                 Cnage
    //                 <em class="ddp-icon-view"></em>
    //             </a>
    //         </li>
    //         <li class="ddp-disabled">
    //             <a href="javascript:">
    //                 <em class="ddp-icon-drop-sort"></em>
    //                 Sort
    //                 <em class="ddp-icon-view"></em>
    //             </a>
    //             <div class="ddp-wrap-popup2 ">
    //                 <ul class="ddp-list-popup ddp-padd">
    //                     <li>
    //                         <a href="#">
    //                             Column name
    //                         </a>
    //                     </li>
    //                     <li>
    //                         <a href="#">
    //                             Column type
    //                             <em class="ddp-icon-view"></em>
    //                         </a>
    //                         <div class="ddp-wrap-popup2 ">
    //                             <ul class="ddp-list-popup ddp-padd">
    //                                 <li>
    //                                     <a href="#">
    //                                         Integer
    //                                     </a>
    //                                 </li>
    //                                 <li>
    //                                     <a href="#">
    //                                         Float
    //                                     </a>
    //                                 </li>
    //                                 <li>
    //                                     <a href="#">
    //                                         String
    //                                     </a>
    //                                 </li>
    //                                 <li>
    //                                     <a href="#">
    //                                         Boolean
    //                                     </a>
    //                                 </li>
    //                             </ul>
    //                         </div>
    //                     </li>
    //                 </ul>
    //             </div>
    //         </li>
    //         <li>
    //             <a href="javascript:">
    //                 <em class="ddp-icon-drop-move"></em>
    //                 Move
    //                 <em class="ddp-icon-view"></em>
    //             </a>
    //         </li>
    //         <li>
    //             <a href="javascript:">
    //                 <em class="ddp-icon-drop-editmodify"></em>
    //                 Edit
    //                 <em class="ddp-icon-view"></em>
    //             </a>
    //         </li>
    //         <li>
    //             <a href="javascript:">
    //                 <em class="ddp-icon-drop-generate"></em>
    //                 Generate
    //                 <em class="ddp-icon-view"></em>
    //             </a>
    //         </li>
    //         <li>
    //             <a href="javascript:">
    //                 <em class="ddp-icon-drop-detail"></em>
    //                 Generate
    //             </a>
    //         </li>
    //         <li>
    //             <a href="javascript:">
    //                 <em class="ddp-icon-drop-clean"></em>
    //                 Clean
    //             </a>
    //         </li>
    //     </ul>
    // </div>
    let $layer;
    // 헤더 메뉴 레이어의 넓이는 160으로 고정됨
    const LAYER_WIDTH = 160;

    // 클래스명
    const classs = {
      // `parent`는 그리드 헤더
      parent: {
        header: {
          target: 'slick-header-column'
        }
      },
      // 그리드의 헤더에 마우스 오버시 추가되는 CSS
      header: {
        button: 'slick-header-menubutton'
      },
      // `헤더 메뉴`
      layer: {
        root: 'slickgrid-wrap-grid-popup slickgrid-type-grid',
        div: 'slickgrid-wrap-grid-popup',
        ul: 'slickgrid-list-grid-popup',
        hasIcons: 'slickgrid-grid-type',
        moreIcon: 'slickgrid-icon-gird-view'
      },
    };

    // 상태 변화 처리를 위해 사용할 클래스명
    const state = {
      parent: {
        header: {
          active: 'slick-header-column-active'
        }
      },
      layer: {
        ul: {
          disabled: "slickgrid-ul-disabled"
        }
      },
    };

    function destroy() {
      _handler.unsubscribeAll();
      $(document.body).off("mousedown", handleBodyMouseDown);
      $(window).off("resize", hideMenu);
    }

    function init(grid) {
      options = $.extend(true, {}, _defaults, options);
      _grid = grid;
      _handler
        .subscribe(_grid.onHeaderCellRendered, handleHeaderCellRendered)
        .subscribe(_grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy);

      _grid.setColumns(_grid.getColumns());

      $(document.body).on("mousedown", handleBodyMouseDown);
      $(window).on("resize", hideMenu);
    }

    function handleHeaderCellRendered(e, args) {

      const column = args.column;
      const menu = column.header && column.header.menu;

      // 그리드 헤더 데이터에 메뉴 데이터가 있는지 검사
      if (menu) {
        // 레이어 활성화 버튼 엘리먼트
        // 레이어(메뉴)를 활성화(보여주도록) 할 수 있도록
        // 보여지는 버튼 엘리먼트
        const $layerActiveHeaderButton = $("<div></div>")
          .addClass(classs.header.button)
          .data("column", column)
          .data("menu", menu);

        if (menu.tooltip) {
          $layerActiveHeaderButton
            .attr("title", menu.tooltip);
        }

        // 헤더 버튼 클릭시 `헤더메뉴`를 보여줍니다
        $layerActiveHeaderButton
          .on("click", showMenu)
          .appendTo(args.node);
      }
    }

    function handleBeforeHeaderCellDestroy(e, args) {
      const column = args.column;
      if (column.header && column.header.menu) {
        $(args.node)
          .find(`.${classs.header.button}`)
          .remove();
      }
    }

    function hideMenu() {
      if ($layer) {
        $layer.remove();
        $layer = null;
        if ($activeHeaderColumn && $activeHeaderColumn.hasClass(state.parent.header.active)) {
          $activeHeaderColumn.removeClass(state.parent.header.active)
        }
      }
    }

    function showMenu(e) {
      const $menuButton = $(this);
      const menu = $menuButton.data("menu");
      const columnDef = $menuButton.data("column");

      // noinspection EqualityComparisonWithCoercionJS
      if (_self.onBeforeMenuShow.notify({
        "grid": _grid,
        "column": columnDef,
        "menu": menu
      }, e, _self) == false) {
        return;
      }

      // `헤더매뉴`가 존재한다면
      if ($layer) {
        // 데이터 및 이벤트 핸들러를 제거합니다
        $layer.empty();
      }

      $layer = $("<div></div>")
        .addClass(classs.layer.root)
        .appendTo(_grid.getContainerNode());

      const $ul = addUlElementToDiv($layer);

      menu.items.forEach(item => {
        if (item.iconClass && !$layer.hasClass(classs.layer.hasIcons)) $layer.addClass(classs.layer.hasIcons);
        createMenu(item, $ul);
      });

      toCalculateLayerOffset.call(this);
      saveActiveHeaderColumn($menuButton);
      addClassToActiveHeaderColumn();

      e.preventDefault();
      e.stopPropagation();
    }

    function createMenu(item, $ul) {
      const $li = createLiElement(item, $ul);
      const $a = createAtagElement(item, $li);

      if (item.disabled) changeLiElementDisabledState($li);
      if (item.iconClass) addIconToAtag(item, $a);
      if (item.title) addTooltip($li, item);

      if (hasChild(item)) {
        addMoreIconToAtag($a);
        createChildMenu($a, item.child);
      }
    }

    function createChildMenu(node, child) {

      const $div = $("<div></div>").addClass(classs.layer.div);
      const $ul = addUlElementToDiv($div);
      node.after($div);

      child.forEach(item => {
        if (item.iconClass && !$div.hasClass(classs.layer.hasIcons)) $div.addClass(classs.layer.hasIcons);
        createMenu(item, $ul);
      });
    }

    function addTooltip($li, item) {
      $li.attr('title', item.title);
    }

    function addIconToAtag(item, $a) {
      $("<em></em>")
        .addClass(item.iconClass)
        .appendTo($a);
    }

    function changeLiElementDisabledState($li) {
      $li.addClass(state.layer.ul.disabled);
    }

    function handleMenuItemClick(item, e) {

      if (item.disabled) {
        return;
      }

      hideMenu();

      e.preventDefault();
      e.stopPropagation();
    }

    function handleBodyMouseDown(e) {
      // noinspection EqualityComparisonWithCoercionJS
      if ($layer && $layer[0] != e.target && !$.contains($layer[0], e.target)) {
        hideMenu();
      }
    }

    function addUlElementToDiv($div) {
      return $('<ul></ul>')
        .addClass(classs.layer.ul)
        .appendTo($div);
    }

    function hasChild(item) {
      return item && item.child.length > 0;
    }

    function toCalculateLayerOffset() {

      // 레이어 offset 보정
      let leftPos = $(this).offset().left;
      const gridPos = _grid.getGridPosition();
      if ((leftPos + LAYER_WIDTH) >= gridPos.width) {
        leftPos = leftPos - LAYER_WIDTH;
      }

      // 레이어 offset 변경
      $layer.offset({
        top: $(this).offset().top + $(this).height(),
        left: leftPos
      });
    }

    function findActiveHeaderColumn($menuButton) {
      return $menuButton.closest(`.${classs.parent.header.target}`);
    }

    function saveActiveHeaderColumn($menuButton) {
      $activeHeaderColumn = findActiveHeaderColumn($menuButton);
    }

    function addClassToActiveHeaderColumn() {
      $activeHeaderColumn.addClass(state.parent.header.active);
    }

    function createLiElement(item, $ul) {
      return $("<li></li>")
        .on("click", !item.handler
          ? (event) => {
            event.stopPropagation();
            handleMenuItemClick(item, event);
          }
          : (event) => {
            event.stopPropagation();
            item.handler.call(handleMenuItemClick(item, event));
          })
        .appendTo($ul);
    }

    function createAtagElement(item, $li) {
      return $("<a></a>")
        .attr('href', 'javascript:')
        .text(item.title)
        .appendTo($li);
    }

    function addMoreIconToAtag($a) {
      $("<em></em>")
        .addClass(classs.layer.moreIcon)
        .appendTo($a);
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy,
      "pluginName": "HeaderMenu",
      "onBeforeMenuShow": new Slick.Event(),
      "onCommand": new Slick.Event()
    });
  }
})(jQuery);
